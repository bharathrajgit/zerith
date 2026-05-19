const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

const DEFAULT_TIMEOUT_MS = Number(process.env.JUDGE0_TIMEOUT_MS || 10000);
const JUDGE0_API_URL = String(process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com').replace(/\/+$/, '');
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';
const JUDGE0_LANGUAGE_ID_JAVA = Number(process.env.JUDGE0_LANGUAGE_ID_JAVA || 62);
const PLACEHOLDER_JUDGE0_KEYS = new Set([
  '',
  'your_key_here',
  'replace_me',
  'rapidapi_key',
  'judge0_api_key',
]);

const normalizeOutput = (value) =>
  String(value || '')
    .replace(/\r\n/g, '\n')
    .trim();

const normalizeStdin = (value) => {
  if (value === null || value === undefined) {
    return '';
  }

  const input = String(value).replace(/\r\n/g, '\n');
  if (!input.length || input.endsWith('\n')) {
    return input;
  }

  return `${input}\n`;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isJudge0Configured = () => (
  Boolean(JUDGE0_API_URL)
  && !PLACEHOLDER_JUDGE0_KEYS.has(String(JUDGE0_API_KEY || '').trim().toLowerCase())
);

const buildJudge0Headers = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (JUDGE0_API_KEY) {
    headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
  }

  try {
    const parsed = new URL(JUDGE0_API_URL);
    headers['X-RapidAPI-Host'] = parsed.host;
  } catch {
    // Ignore malformed URL header enrichment.
  }

  return headers;
};

const judge0Client = axios.create({
  baseURL: JUDGE0_API_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: buildJudge0Headers(),
});

const runProcess = ({ command, args, cwd, stdin = '', timeoutMs = DEFAULT_TIMEOUT_MS }) =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let finished = false;

    const timer = setTimeout(() => {
      if (finished) return;
      finished = true;
      child.kill();
      resolve({
        ok: false,
        timeout: true,
        stdout,
        stderr,
        exitCode: null,
      });
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({
        ok: false,
        timeout: false,
        stdout,
        stderr: error.message,
        exitCode: null,
        spawnError: error,
      });
    });

    child.on('close', (exitCode) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve({
        ok: exitCode === 0,
        timeout: false,
        stdout,
        stderr,
        exitCode,
      });
    });

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });

const compileWrappedSource = async (sourceCode) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'behaviorlearn-diagnostic-'));
  const filePath = path.join(tempDir, 'Main.java');

  await fs.writeFile(filePath, sourceCode, 'utf8');

  const compileResult = await runProcess({
    command: 'javac',
    args: [filePath],
    cwd: tempDir,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });

  if (compileResult.spawnError) {
    return {
      ok: false,
      verdict: 'Compilation Error',
      compileOutput: 'Java compiler is not available on the server.',
      tempDir,
    };
  }

  if (!compileResult.ok) {
    return {
      ok: false,
      verdict: compileResult.timeout ? 'Time Limit Exceeded' : 'Compilation Error',
      compileOutput: normalizeOutput(compileResult.stderr || compileResult.stdout),
      tempDir,
    };
  }

  return {
    ok: true,
    tempDir,
    compileOutput: normalizeOutput(compileResult.stderr || compileResult.stdout),
  };
};

const executeWrappedSource = async ({ tempDir, input, timeoutMs = DEFAULT_TIMEOUT_MS }) => {
  const startedAt = Date.now();
  const runResult = await runProcess({
    command: 'java',
    args: ['-cp', tempDir, 'Main'],
    cwd: tempDir,
    stdin: normalizeStdin(input),
    timeoutMs,
  });
  const runtimeMs = Date.now() - startedAt;

  if (runResult.timeout) {
    return {
      ok: false,
      status: 'Time Limit Exceeded',
      stdout: normalizeOutput(runResult.stdout),
      stderr: normalizeOutput(runResult.stderr),
      time: runtimeMs / 1000,
      memory: null,
    };
  }

  if (runResult.spawnError) {
    return {
      ok: false,
      status: 'Runtime Error',
      stdout: normalizeOutput(runResult.stdout),
      stderr: normalizeOutput(runResult.stderr || runResult.spawnError.message),
      time: runtimeMs / 1000,
      memory: null,
    };
  }

  return {
    ok: runResult.ok,
    status: runResult.ok ? 'Accepted' : 'Runtime Error',
    stdout: normalizeOutput(runResult.stdout),
    stderr: normalizeOutput(runResult.stderr),
    time: runtimeMs / 1000,
    memory: null,
  };
};

const submitToJudge0 = async ({ sourceCode, stdin, expectedOutput }) => {
  if (!isJudge0Configured()) {
    const missing = !JUDGE0_API_KEY ? 'JUDGE0_API_KEY' : 'Judge0 configuration';
    throw new Error(`${missing} is not configured`);
  }

  const submissionResponse = await judge0Client.post('/submissions?base64_encoded=false&wait=false', {
    source_code: sourceCode,
    language_id: JUDGE0_LANGUAGE_ID_JAVA,
    stdin: normalizeStdin(stdin),
    expected_output: expectedOutput,
  });

  const token = submissionResponse.data?.token;
  if (!token) {
    throw new Error('Judge0 did not return a submission token');
  }

  const startedAt = Date.now();
  let latest = null;

  while (Date.now() - startedAt <= DEFAULT_TIMEOUT_MS) {
    const pollResponse = await judge0Client.get(`/submissions/${token}?base64_encoded=false`);
    latest = pollResponse.data;
    const statusId = Number(latest?.status?.id || 0);

    if (statusId > 2) {
      return {
        stdout: normalizeOutput(latest?.stdout),
        stderr: normalizeOutput(latest?.stderr || latest?.compile_output),
        status: latest?.status?.description || 'Unknown',
        time: Number(latest?.time || 0),
        memory: latest?.memory || null,
      };
    }

    await sleep(1000);
  }

  return {
    stdout: normalizeOutput(latest?.stdout),
    stderr: 'Judge0 polling timed out',
    status: 'Time Limit Exceeded',
    time: 0,
    memory: null,
  };
};

const runTestCase = async (code, input, expectedOutput) => {
  const result = await submitToJudge0({
    sourceCode: code,
    stdin: input,
    expectedOutput,
  });

  return {
    passed: normalizeOutput(result.stdout) === normalizeOutput(expectedOutput)
      && result.status.toLowerCase() === 'accepted',
    stdout: result.stdout,
    stderr: result.stderr,
    status: result.status,
    time: result.time,
    memory: result.memory,
  };
};

const summarizeOverallStatus = (results = []) => {
  if (results.every((result) => result.passed)) return 'accepted';
  if (results.some((result) => (result.status || '').toLowerCase().includes('error'))
    || results.some((result) => (result.status || '').toLowerCase().includes('compilation'))
    || results.some((result) => (result.status || '').toLowerCase().includes('runtime'))
    || results.some((result) => (result.status || '').toLowerCase().includes('time limit'))) {
    return 'error';
  }
  return 'wrong_answer';
};

const runAllTestCases = async (code, testCases = []) => {
  const results = [];

  for (const testCase of testCases) {
    const result = await runTestCase(code, testCase.input, testCase.expectedOutput);
    results.push({
      passed: result.passed,
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      time: result.time,
      memory: result.memory,
      isHidden: !!testCase.isHidden,
    });
  }

  return {
    passedCount: results.filter((result) => result.passed).length,
    totalCount: results.length,
    results,
    overallStatus: summarizeOverallStatus(results),
  };
};

const sanitizeStudentCode = (source) =>
  String(source || '')
    .replace(/public\s+class\s+/g, 'class ')
    .trim();

const helperSnippets = {
  readLines: `
    private static java.util.List<String> readAllLines() throws Exception {
        java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(System.in));
        java.util.List<String> lines = new java.util.ArrayList<>();
        String line;
        while ((line = reader.readLine()) != null) {
            lines.add(line);
        }
        return lines;
    }

    private static String getLine(java.util.List<String> lines, int index) {
        return index < lines.size() ? lines.get(index) : "";
    }
  `,
  parseIntArray: `
    private static int[] parseIntArray(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new int[0];
        }
        String[] parts = line.split(",");
        int[] values = new int[parts.length];
        for (int i = 0; i < parts.length; i += 1) {
            values[i] = Integer.parseInt(parts[i].trim());
        }
        return values;
    }
  `,
  parseStringArray: `
    private static String[] parseStringArray(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new String[0];
        }
        String[] parts = line.split(",");
        for (int i = 0; i < parts.length; i += 1) {
            parts[i] = parts[i].trim();
        }
        return parts;
    }
  `,
  parseStringList: `
    private static java.util.List<String> parseStringList(String line) {
        java.util.List<String> values = new java.util.ArrayList<>();
        if (line == null || line.trim().isEmpty()) {
            return values;
        }
        for (String part : line.split(",")) {
            values.add(part.trim());
        }
        return values;
    }
  `,
  parsePairMatrix: `
    private static int[][] parsePairMatrix(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new int[0][0];
        }
        String[] groups = line.split(";");
        int[][] values = new int[groups.length][2];
        for (int i = 0; i < groups.length; i += 1) {
            String[] parts = groups[i].split(",");
            values[i][0] = Integer.parseInt(parts[0].trim());
            values[i][1] = Integer.parseInt(parts[1].trim());
        }
        return values;
    }
  `,
  parseCharGrid: `
    private static char[][] parseCharGrid(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new char[0][0];
        }
        String[] rows = line.split(";");
        char[][] grid = new char[rows.length][];
        for (int i = 0; i < rows.length; i += 1) {
            grid[i] = rows[i].trim().toCharArray();
        }
        return grid;
    }
  `,
  parseIntGrid: `
    private static int[][] parseIntGrid(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new int[0][0];
        }
        String[] rows = line.split(";");
        int[][] grid = new int[rows.length][];
        for (int i = 0; i < rows.length; i += 1) {
            grid[i] = parseIntArray(rows[i]);
        }
        return grid;
    }
  `,
  formatIntArray: `
    private static String formatIntArray(int[] values) {
        if (values == null || values.length == 0) {
            return "<empty>";
        }
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < values.length; i += 1) {
            if (i > 0) {
                builder.append(",");
            }
            builder.append(values[i]);
        }
        return builder.toString();
    }
  `,
  formatString: `
    private static String formatString(String value) {
        return value == null || value.isEmpty() ? "<empty>" : value;
    }
  `,
  formatDouble: `
    private static String formatDouble(double value) {
        java.text.DecimalFormat format = new java.text.DecimalFormat("0.#####");
        format.setDecimalSeparatorAlwaysShown(false);
        return format.format(value);
    }
  `,
  parseTree: `
    private static TreeNode parseTree(String line) {
        if (line == null || line.trim().isEmpty() || line.trim().equals("null")) {
            return null;
        }

        String[] parts = line.split(",");
        TreeNode root = new TreeNode(Integer.parseInt(parts[0].trim()));
        java.util.Queue<TreeNode> queue = new java.util.ArrayDeque<>();
        queue.offer(root);
        int index = 1;

        while (!queue.isEmpty() && index < parts.length) {
            TreeNode current = queue.poll();

            String leftToken = parts[index++].trim();
            if (!leftToken.equals("null")) {
                current.left = new TreeNode(Integer.parseInt(leftToken));
                queue.offer(current.left);
            }

            if (index < parts.length) {
                String rightToken = parts[index++].trim();
                if (!rightToken.equals("null")) {
                    current.right = new TreeNode(Integer.parseInt(rightToken));
                    queue.offer(current.right);
                }
            }
        }

        return root;
    }
  `,
  serializeTree: `
    private static String serializeTree(TreeNode root) {
        if (root == null) {
            return "null";
        }

        java.util.List<String> values = new java.util.ArrayList<>();
        java.util.List<TreeNode> queue = new java.util.ArrayList<>();
        queue.add(root);
        int head = 0;

        while (head < queue.size()) {
            TreeNode node = queue.get(head++);
            if (node == null) {
                values.add("null");
                continue;
            }

            values.add(String.valueOf(node.val));
            queue.add(node.left);
            queue.add(node.right);
        }

        int last = values.size() - 1;
        while (last >= 0 && values.get(last).equals("null")) {
            last -= 1;
        }

        StringBuilder builder = new StringBuilder();
        for (int i = 0; i <= last; i += 1) {
            if (i > 0) {
                builder.append(",");
            }
            builder.append(values.get(i));
        }
        return builder.toString();
    }
  `,
  formatTriplets: `
    private static String formatTriplets(java.util.List<java.util.List<Integer>> triplets) {
        if (triplets == null || triplets.isEmpty()) {
            return "<empty>";
        }

        java.util.List<String> tokens = new java.util.ArrayList<>();
        for (java.util.List<Integer> triplet : triplets) {
            java.util.List<Integer> copy = new java.util.ArrayList<>(triplet);
            java.util.Collections.sort(copy);
            tokens.add("[" + copy.get(0) + "," + copy.get(1) + "," + copy.get(2) + "]");
        }

        java.util.Collections.sort(tokens);
        return String.join(";", tokens);
    }
  `,
  lruHelpers: `
    private static String[] parseOperations(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new String[0];
        }
        String[] parts = line.split(",");
        for (int i = 0; i < parts.length; i += 1) {
            parts[i] = parts[i].trim();
        }
        return parts;
    }

    private static String[] parseArgumentGroups(String line) {
        if (line == null || line.trim().isEmpty()) {
            return new String[0];
        }
        String[] parts = line.split(";");
        for (int i = 0; i < parts.length; i += 1) {
            parts[i] = parts[i].trim();
        }
        return parts;
    }
  `,
};

const helperDependencies = {
  parseIntGrid: ['parseIntArray'],
};

const resolveHelperKeys = (helperKeys = []) => {
  const ordered = [];
  const visited = new Set();

  const visit = (key) => {
    if (!key || visited.has(key)) return;
    visited.add(key);

    const dependencies = helperDependencies[key] || [];
    dependencies.forEach(visit);

    if (helperSnippets[key]) {
      ordered.push(key);
    }
  };

  helperKeys.forEach(visit);
  return ordered;
};

const createMainClass = (helperKeys, body) => `
public class Main {
${resolveHelperKeys(helperKeys).map((key) => helperSnippets[key]).join('\n')}

    public static void main(String[] args) throws Exception {
${body}
    }
}
`;

const runnerBuilders = {
  'basic-two-sum': () => createMainClass(['readLines', 'parseIntArray', 'formatIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums = parseIntArray(getLine(lines, 0));
        int target = Integer.parseInt(getLine(lines, 1).trim());
        Solution solution = new Solution();
        System.out.print(formatIntArray(solution.twoSum(nums, target)));
  `),
  'basic-reverse-array': () => createMainClass(['readLines', 'parseIntArray', 'formatIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums = parseIntArray(getLine(lines, 0));
        Solution solution = new Solution();
        solution.reverseArray(nums);
        System.out.print(formatIntArray(nums));
  `),
  'basic-palindrome-string': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.isPalindrome(getLine(lines, 0).trim()));
  `),
  'basic-find-maximum': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.findMaximum(parseIntArray(getLine(lines, 0))));
  `),
  'basic-count-vowels': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.countVowels(getLine(lines, 0)));
  `),
  'basic-fibonacci': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.fibonacci(Integer.parseInt(getLine(lines, 0).trim())));
  `),
  'basic-sum-array': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.sumArray(parseIntArray(getLine(lines, 0))));
  `),
  'basic-remove-duplicates': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums = parseIntArray(getLine(lines, 0));
        Solution solution = new Solution();
        int length = solution.removeDuplicates(nums);
        StringBuilder builder = new StringBuilder();
        builder.append(length).append("|");
        for (int i = 0; i < length; i += 1) {
            if (i > 0) {
                builder.append(",");
            }
            builder.append(nums[i]);
        }
        System.out.print(builder.toString());
  `),
  'medium-valid-parentheses': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.isValid(getLine(lines, 0).trim()));
  `),
  'medium-binary-search': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums = parseIntArray(getLine(lines, 0));
        int target = Integer.parseInt(getLine(lines, 1).trim());
        Solution solution = new Solution();
        System.out.print(solution.binarySearch(nums, target));
  `),
  'medium-merge-sorted-arrays': () => createMainClass(['readLines', 'parseIntArray', 'formatIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums1 = parseIntArray(getLine(lines, 0));
        int[] nums2 = parseIntArray(getLine(lines, 1));
        Solution solution = new Solution();
        System.out.print(formatIntArray(solution.mergeSortedArrays(nums1, nums2)));
  `),
  'medium-longest-common-prefix': () => createMainClass(['readLines', 'parseStringArray', 'formatString'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(formatString(solution.longestCommonPrefix(parseStringArray(getLine(lines, 0)))));
  `),
  'medium-power-of-two': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.isPowerOfTwo(Integer.parseInt(getLine(lines, 0).trim())));
  `),
  'medium-rotate-array': () => createMainClass(['readLines', 'parseIntArray', 'formatIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums = parseIntArray(getLine(lines, 0));
        int k = Integer.parseInt(getLine(lines, 1).trim());
        Solution solution = new Solution();
        solution.rotate(nums, k);
        System.out.print(formatIntArray(nums));
  `),
  'medium-missing-number': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.missingNumber(parseIntArray(getLine(lines, 0))));
  `),
  'medium-single-number': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.singleNumber(parseIntArray(getLine(lines, 0))));
  `),
  'medium-maximum-subarray': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.maxSubArray(parseIntArray(getLine(lines, 0))));
  `),
  'medium-first-last-position': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        int[] nums = parseIntArray(getLine(lines, 0));
        int target = Integer.parseInt(getLine(lines, 1).trim());
        Solution solution = new Solution();
        int[] answer = solution.searchRange(nums, target);
        System.out.print(answer[0] + "," + answer[1]);
  `),
  'hard-lru-cache': () => createMainClass(['readLines', 'lruHelpers'], `
        java.util.List<String> lines = readAllLines();
        int capacity = Integer.parseInt(getLine(lines, 0).trim());
        String[] operations = parseOperations(getLine(lines, 1));
        String[] arguments = parseArgumentGroups(getLine(lines, 2));
        LRUCache cache = new LRUCache(capacity);
        java.util.List<String> output = new java.util.ArrayList<>();

        for (int i = 0; i < operations.length; i += 1) {
            String operation = operations[i];
            String argument = i < arguments.length ? arguments[i] : "";
            if ("put".equals(operation)) {
                String[] parts = argument.split(" ");
                cache.put(Integer.parseInt(parts[0].trim()), Integer.parseInt(parts[1].trim()));
                output.add("null");
            } else if ("get".equals(operation)) {
                output.add(String.valueOf(cache.get(Integer.parseInt(argument.trim()))));
            }
        }

        System.out.print(String.join(",", output));
  `),
  'hard-serialize-deserialize-tree': () => createMainClass(['readLines', 'parseTree', 'serializeTree'], `
        java.util.List<String> lines = readAllLines();
        TreeNode original = parseTree(getLine(lines, 0).trim());
        Codec codec = new Codec();
        String serialized = codec.serialize(original);
        TreeNode rebuilt = codec.deserialize(serialized);
        System.out.print(serializeTree(rebuilt));
  `),
  'hard-trapping-rain-water': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.trap(parseIntArray(getLine(lines, 0))));
  `),
  'hard-word-break': () => createMainClass(['readLines', 'parseStringList'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.wordBreak(getLine(lines, 0).trim(), parseStringList(getLine(lines, 1))));
  `),
  'hard-longest-palindromic-substring': () => createMainClass(['readLines', 'formatString'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(formatString(solution.longestPalindrome(getLine(lines, 0).trim())));
  `),
  'hard-course-schedule': () => createMainClass(['readLines', 'parsePairMatrix'], `
        java.util.List<String> lines = readAllLines();
        int numCourses = Integer.parseInt(getLine(lines, 0).trim());
        int[][] prerequisites = parsePairMatrix(getLine(lines, 1));
        Solution solution = new Solution();
        System.out.print(solution.canFinish(numCourses, prerequisites));
  `),
  'hard-number-of-islands': () => createMainClass(['readLines', 'parseCharGrid'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.numIslands(parseCharGrid(getLine(lines, 0))));
  `),
  'hard-minimum-path-sum': () => createMainClass(['readLines', 'parseIntGrid'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.minPathSum(parseIntGrid(getLine(lines, 0))));
  `),
  'hard-decode-ways': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.numDecodings(getLine(lines, 0).trim()));
  `),
  'hard-jump-game-ii': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.jump(parseIntArray(getLine(lines, 0))));
  `),
  'hard-container-most-water': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.maxArea(parseIntArray(getLine(lines, 0))));
  `),
  'hard-three-sum': () => createMainClass(['readLines', 'parseIntArray', 'formatTriplets'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(formatTriplets(solution.threeSum(parseIntArray(getLine(lines, 0)))));
  `),
  'hard-longest-increasing-subsequence': () => createMainClass(['readLines', 'parseIntArray'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.lengthOfLIS(parseIntArray(getLine(lines, 0))));
  `),
  'hard-edit-distance': () => createMainClass(['readLines'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.minDistance(getLine(lines, 0), getLine(lines, 1)));
  `),
  'hard-binary-tree-maximum-path-sum': () => createMainClass(['readLines', 'parseTree'], `
        java.util.List<String> lines = readAllLines();
        Solution solution = new Solution();
        System.out.print(solution.maxPathSum(parseTree(getLine(lines, 0).trim())));
  `),
  'hard-median-two-sorted-arrays': () => createMainClass(['readLines', 'parseIntArray', 'formatDouble'], `
        java.util.List<String> lines = readAllLines();
        int[] nums1 = parseIntArray(getLine(lines, 0));
        int[] nums2 = parseIntArray(getLine(lines, 1));
        Solution solution = new Solution();
        System.out.print(formatDouble(solution.findMedianSortedArrays(nums1, nums2)));
  `),
};

const buildDiagnosticSource = (problemId, studentCode) => {
  const builder = runnerBuilders[problemId];
  if (!builder) {
    throw new Error(`Unsupported diagnostic problem: ${problemId}`);
  }

  const sanitized = sanitizeStudentCode(studentCode);
  return `${sanitized}\n\n${builder()}`;
};

const runDiagnosticProblemLocally = async (problemId, code, testCases = []) => {
  const sourceCode = buildDiagnosticSource(problemId, code);
  const compileResult = await compileWrappedSource(sourceCode);

  if (!compileResult.ok) {
    if (compileResult.tempDir) {
      await fs.rm(compileResult.tempDir, { recursive: true, force: true });
    }

    return {
      passedCount: 0,
      totalCount: testCases.length,
      results: testCases.map((testCase) => ({
        passed: false,
        stdout: '',
        stderr: compileResult.compileOutput || 'Compilation Error',
        status: compileResult.verdict,
        time: 0,
        memory: null,
        isHidden: !!testCase.isHidden,
      })),
      overallStatus: 'error',
      compileOutput: compileResult.compileOutput || '',
    };
  }

  const results = [];

  try {
    for (const testCase of testCases) {
      const execution = await executeWrappedSource({
        tempDir: compileResult.tempDir,
        input: testCase.input,
      });
      const passed = execution.ok
        && normalizeOutput(execution.stdout) === normalizeOutput(testCase.expectedOutput);

      results.push({
        passed,
        stdout: execution.stdout,
        stderr: execution.stderr,
        status: execution.ok ? (passed ? 'Accepted' : 'Wrong Answer') : execution.status,
        time: execution.time,
        memory: execution.memory,
        isHidden: !!testCase.isHidden,
      });
    }
  } finally {
    await fs.rm(compileResult.tempDir, { recursive: true, force: true });
  }

  return {
    passedCount: results.filter((result) => result.passed).length,
    totalCount: results.length,
    results,
    overallStatus: summarizeOverallStatus(results),
    compileOutput: compileResult.compileOutput || '',
  };
};

const isLocalCompilerUnavailable = (result) =>
  String(result?.compileOutput || '').toLowerCase().includes('java compiler is not available');

const shouldVerifyLocally = (result = {}) =>
  Number(result.passedCount || 0) < Number(result.totalCount || 0)
  || !Array.isArray(result.results)
  || result.results.length === 0
  || result.overallStatus !== 'accepted';

const shouldPreferLocalResult = (remoteResult = {}, localResult = {}) => {
  if (!Array.isArray(localResult.results) || !localResult.results.length) return false;
  if (isLocalCompilerUnavailable(localResult)) return false;

  const remotePassed = Number(remoteResult.passedCount || 0);
  const localPassed = Number(localResult.passedCount || 0);

  if (localPassed > remotePassed) return true;
  if (localPassed < remotePassed) return false;

  if (localResult.overallStatus === 'accepted' && remoteResult.overallStatus !== 'accepted') {
    return true;
  }

  if ((!Array.isArray(remoteResult.results) || !remoteResult.results.length) && localResult.results.length) {
    return true;
  }

  return false;
};

const runDiagnosticProblem = async (problemId, code, testCases = []) => {
  const sourceCode = buildDiagnosticSource(problemId, code);

  try {
    const localPrimary = await runDiagnosticProblemLocally(problemId, code, testCases);
    if (!isLocalCompilerUnavailable(localPrimary)) {
      return {
        ...localPrimary,
        sourceCode,
        serviceUnavailable: false,
        executionMode: 'local',
      };
    }

    const remote = await runAllTestCases(sourceCode, testCases);
    if (shouldVerifyLocally(remote) && shouldPreferLocalResult(remote, localPrimary)) {
      return {
        ...localPrimary,
        sourceCode,
        serviceUnavailable: false,
        executionMode: 'local_verified',
      };
    }

    return {
      ...remote,
      sourceCode,
      serviceUnavailable: false,
      executionMode: 'judge0',
    };
  } catch (error) {
    return {
      passedCount: 0,
      totalCount: testCases.length,
      results: [],
      overallStatus: 'error',
      sourceCode,
      serviceUnavailable: true,
      executionMode: 'service_unavailable',
      error: error.message,
    };
  }
};

module.exports = {
  buildDiagnosticSource,
  isJudge0Configured,
  normalizeOutput,
  runTestCase,
  runAllTestCases,
  runDiagnosticProblem,
  runDiagnosticProblemLocally,
};
