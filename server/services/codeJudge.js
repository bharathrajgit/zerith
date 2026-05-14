const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const normalizeOutput = (value) =>
  String(value || '')
    .replace(/\r\n/g, '\n')
    .trim();

const parseClassName = (code) => {
  const publicMatch = String(code || '').match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (publicMatch) return publicMatch[1];

  const classMatch = String(code || '').match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (classMatch) return classMatch[1];

  return 'Solution';
};

const runProcess = ({ command, args, cwd, stdin = '', timeoutMs = 5000 }) =>
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

const compileJava = async (sourceCode) => {
  const className = parseClassName(sourceCode);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dsa-java-'));
  const filePath = path.join(tempDir, `${className}.java`);

  await fs.writeFile(filePath, sourceCode, 'utf8');

  const compileResult = await runProcess({
    command: 'javac',
    args: [filePath],
    cwd: tempDir,
    timeoutMs: 10000,
  });

  if (compileResult.spawnError) {
    return {
      ok: false,
      verdict: 'Compilation Error',
      compileOutput: 'Java compiler not available on the server.',
      tempDir,
    };
  }

  if (!compileResult.ok) {
    return {
      ok: false,
      verdict: compileResult.timeout ? 'Time Limit Exceeded' : 'Compilation Error',
      compileOutput: compileResult.stderr || compileResult.stdout,
      tempDir,
    };
  }

  return {
    ok: true,
    className,
    tempDir,
    compileOutput: compileResult.stderr || compileResult.stdout || '',
  };
};

const executeJava = async ({ tempDir, className, input, timeLimitSeconds = 30 }) => {
  const startedAt = Date.now();
  const runResult = await runProcess({
    command: 'java',
    args: ['-cp', tempDir, className],
    cwd: tempDir,
    stdin: input,
    timeoutMs: Math.max(1000, Number(timeLimitSeconds || 30) * 1000),
  });
  const runtimeMs = Date.now() - startedAt;

  if (runResult.timeout) {
    return {
      ok: false,
      verdict: 'Time Limit Exceeded',
      actualOutput: normalizeOutput(runResult.stdout),
      error: normalizeOutput(runResult.stderr),
      runtimeMs,
    };
  }

  if (runResult.spawnError) {
    return {
      ok: false,
      verdict: 'Runtime Error',
      actualOutput: normalizeOutput(runResult.stdout),
      error: normalizeOutput(runResult.stderr || runResult.spawnError.message),
      runtimeMs,
    };
  }

  if (!runResult.ok) {
    return {
      ok: false,
      verdict: 'Runtime Error',
      actualOutput: normalizeOutput(runResult.stdout),
      error: normalizeOutput(runResult.stderr),
      runtimeMs,
    };
  }

  return {
    ok: true,
    verdict: 'Accepted',
    actualOutput: normalizeOutput(runResult.stdout),
    error: normalizeOutput(runResult.stderr),
    runtimeMs,
  };
};

const judgeJavaSubmission = async ({
  sourceCode,
  testCases,
  mode = 'run',
  timeLimitSeconds = 30,
}) => {
  const compileResult = await compileJava(sourceCode);
  if (!compileResult.ok) {
    if (compileResult.tempDir) {
      await fs.rm(compileResult.tempDir, { recursive: true, force: true });
    }
    return {
      verdict: compileResult.verdict,
      compileOutput: compileResult.compileOutput || '',
      runtimeOutput: '',
      executionTimeMs: 0,
      testResults: [],
      passedVisibleCount: 0,
      totalVisibleCount: 0,
      passedHiddenCount: 0,
      totalHiddenCount: 0,
    };
  }

  let maxRuntime = 0;
  const testResults = [];
  let verdict = 'Accepted';
  let runtimeOutput = '';

  try {
    for (const testCase of testCases) {
      const result = await executeJava({
        tempDir: compileResult.tempDir,
        className: compileResult.className,
        input: testCase.input || '',
        timeLimitSeconds,
      });

      maxRuntime = Math.max(maxRuntime, result.runtimeMs || 0);
      const expectedOutput = normalizeOutput(testCase.expectedOutput);
      const actualOutput = normalizeOutput(result.actualOutput);
      const passed = result.ok && actualOutput === expectedOutput;
      const failedVerdict = result.verdict === 'Accepted' ? 'Wrong Answer' : result.verdict;

      if (!runtimeOutput) {
        runtimeOutput = actualOutput || result.error || '';
      }

      testResults.push({
        input: testCase.input || '',
        expectedOutput: mode === 'submit' && testCase.isHidden ? '' : expectedOutput,
        actualOutput: mode === 'submit' && testCase.isHidden ? '' : actualOutput,
        passed,
        isHidden: !!testCase.isHidden,
        runtimeMs: result.runtimeMs || 0,
        error: result.error || '',
      });

      if (!passed) {
        verdict = failedVerdict;
        break;
      }
    }
  } finally {
    await fs.rm(compileResult.tempDir, { recursive: true, force: true });
  }

  const visibleResults = testResults.filter((result) => !result.isHidden);
  const hiddenResults = testResults.filter((result) => result.isHidden);

  return {
    verdict,
    compileOutput: compileResult.compileOutput || '',
    runtimeOutput,
    executionTimeMs: maxRuntime,
    testResults,
    passedVisibleCount: visibleResults.filter((result) => result.passed).length,
    totalVisibleCount: visibleResults.length,
    passedHiddenCount: hiddenResults.filter((result) => result.passed).length,
    totalHiddenCount: hiddenResults.length,
  };
};

module.exports = {
  judgeJavaSubmission,
  normalizeOutput,
};
