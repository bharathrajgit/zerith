const timeLimitByDifficulty = {
  Basic: 900,
  Medium: 1200,
  Hard: 1500,
};

const problem = ({
  problemId,
  title,
  description,
  difficulty,
  topic,
  javaStarterCode,
  visibleTestCases,
  hiddenTestCases,
  hints,
  execution,
}) => ({
  problemId,
  title,
  description,
  difficulty,
  topic,
  timeLimit: timeLimitByDifficulty[difficulty],
  javaStarterCode: `${javaStarterCode.trim()}\n`,
  visibleTestCases,
  hiddenTestCases,
  hints,
  execution,
});

const basic = [
  problem({
    problemId: 'basic-two-sum',
    title: 'Two Sum',
    description:
      'Given an integer array and a target value, return the indices of the two numbers whose sum equals the target. You may assume exactly one valid pair exists, and you should return the indices in ascending order.',
    difficulty: 'Basic',
    topic: 'Arrays',
    javaStarterCode: `
import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }
}
    `,
    visibleTestCases: [
      { input: '2,7,11,15\n9', expectedOutput: '0,1' },
      { input: '3,2,4\n6', expectedOutput: '1,2' },
    ],
    hiddenTestCases: [
      { input: '3,3\n6', expectedOutput: '0,1' },
      { input: '1,5,3,7,9\n12', expectedOutput: '1,3' },
      { input: '10,-2,4,8\n6', expectedOutput: '1,3' },
    ],
    hints: [
      'Track numbers you have already seen so you can look up the complement quickly.',
      'Return indices, not the values themselves.',
    ],
    execution: { type: 'twoSum' },
  }),
  problem({
    problemId: 'basic-reverse-array',
    title: 'Reverse Array',
    description:
      'Reverse the given integer array in place. Your method should modify the original array and the judge will print the final array after your function runs.',
    difficulty: 'Basic',
    topic: 'Arrays',
    javaStarterCode: `
import java.util.*;

class Solution {
    public void reverseArray(int[] nums) {
        // Your solution here
    }
}
    `,
    visibleTestCases: [
      { input: '1,2,3,4,5', expectedOutput: '5,4,3,2,1' },
      { input: '9,8,7,6', expectedOutput: '6,7,8,9' },
    ],
    hiddenTestCases: [
      { input: '42', expectedOutput: '42' },
      { input: '-1,-2,-3', expectedOutput: '-3,-2,-1' },
      { input: '5,5,5,5', expectedOutput: '5,5,5,5' },
    ],
    hints: [
      'Swap elements from the two ends while moving toward the center.',
      'A single pass with two pointers is enough.',
    ],
    execution: { type: 'reverseArray' },
  }),
  problem({
    problemId: 'basic-palindrome-string',
    title: 'Check Palindrome String',
    description:
      'Return true if the input string reads the same from left to right and right to left. Treat the string exactly as given and compare characters directly.',
    difficulty: 'Basic',
    topic: 'Strings',
    javaStarterCode: `
class Solution {
    public boolean isPalindrome(String text) {
        // Your solution here
        return false;
    }
}
    `,
    visibleTestCases: [
      { input: 'racecar', expectedOutput: 'true' },
      { input: 'hello', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: 'level', expectedOutput: 'true' },
      { input: 'abcba', expectedOutput: 'true' },
      { input: 'openai', expectedOutput: 'false' },
    ],
    hints: [
      'Compare mirrored characters from both ends of the string.',
      'You can stop as soon as one mismatch is found.',
    ],
    execution: { type: 'palindromeString' },
  }),
  problem({
    problemId: 'basic-find-maximum',
    title: 'Find Maximum Element',
    description:
      'Return the maximum value present in the integer array. The array is guaranteed to contain at least one element.',
    difficulty: 'Basic',
    topic: 'Arrays',
    javaStarterCode: `
class Solution {
    public int findMaximum(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '3,1,4,1,5,9', expectedOutput: '9' },
      { input: '-10,-3,-25,-1', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: '8', expectedOutput: '8' },
      { input: '0,0,0,0', expectedOutput: '0' },
      { input: '12,7,19,4,11', expectedOutput: '19' },
    ],
    hints: [
      'Keep track of the best value seen so far while scanning once.',
      'Initialize the answer from the first element.',
    ],
    execution: { type: 'maxElement' },
  }),
  problem({
    problemId: 'basic-count-vowels',
    title: 'Count Vowels',
    description:
      'Count how many vowels appear in the string. Treat both lowercase and uppercase vowels as valid, and count only a, e, i, o, and u.',
    difficulty: 'Basic',
    topic: 'Strings',
    javaStarterCode: `
class Solution {
    public int countVowels(String text) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: 'hello world', expectedOutput: '3' },
      { input: 'AEIOUxyz', expectedOutput: '5' },
    ],
    hiddenTestCases: [
      { input: 'behaviorlearn', expectedOutput: '6' },
      { input: 'rhythm', expectedOutput: '0' },
      { input: 'Queueing', expectedOutput: '5' },
    ],
    hints: [
      'Convert each character to one consistent case before checking.',
      'A switch statement or membership test works well here.',
    ],
    execution: { type: 'countVowels' },
  }),
  problem({
    problemId: 'basic-fibonacci',
    title: 'Fibonacci Nth Number',
    description:
      'Return the nth Fibonacci number where F(0) = 0 and F(1) = 1. Use an iterative solution so it stays efficient for larger values of n.',
    difficulty: 'Basic',
    topic: 'Basic Algorithms',
    javaStarterCode: `
class Solution {
    public int fibonacci(int n) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '10', expectedOutput: '55' },
      { input: '1', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '0', expectedOutput: '0' },
      { input: '7', expectedOutput: '13' },
      { input: '15', expectedOutput: '610' },
    ],
    hints: [
      'Build the sequence from the bottom up instead of using recursion.',
      'You only need the previous two numbers at any moment.',
    ],
    execution: { type: 'fibonacci' },
  }),
  problem({
    problemId: 'basic-sum-array',
    title: 'Sum of Array',
    description:
      'Return the sum of all integers in the array. The array may contain positive, negative, or zero values.',
    difficulty: 'Basic',
    topic: 'Arrays',
    javaStarterCode: `
class Solution {
    public int sumArray(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '1,2,3,4,5', expectedOutput: '15' },
      { input: '-2,4,6,-8', expectedOutput: '0' },
    ],
    hiddenTestCases: [
      { input: '0,0,0', expectedOutput: '0' },
      { input: '9', expectedOutput: '9' },
      { input: '100,-50,25,-10,5', expectedOutput: '70' },
    ],
    hints: [
      'Accumulate the values in a running total.',
      'A single loop is enough for the whole task.',
    ],
    execution: { type: 'sumArray' },
  }),
  problem({
    problemId: 'basic-remove-duplicates',
    title: 'Remove Duplicates',
    description:
      'Given a sorted array, remove duplicates in place and return the new length. The judge prints the result as `length|trimmed-array`, where the trimmed array contains the first `length` values after your method finishes.',
    difficulty: 'Basic',
    topic: 'Two Pointers',
    javaStarterCode: `
class Solution {
    public int removeDuplicates(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '1,1,2,3,3', expectedOutput: '3|1,2,3' },
      { input: '0,0,1,1,1,2,2,3,3,4', expectedOutput: '5|0,1,2,3,4' },
    ],
    hiddenTestCases: [
      { input: '5,5,5,5', expectedOutput: '1|5' },
      { input: '1,2,3,4', expectedOutput: '4|1,2,3,4' },
      { input: '-2,-2,-1,0,0,3', expectedOutput: '4|-2,-1,0,3' },
    ],
    hints: [
      'Use one pointer to track the place where the next unique value should go.',
      'Because the array is sorted, duplicates always appear next to each other.',
    ],
    execution: { type: 'removeDuplicates' },
  }),
];

const medium = [
  problem({
    problemId: 'medium-valid-parentheses',
    title: 'Valid Parentheses',
    description:
      'Check whether the bracket sequence is balanced. The input can contain `()`, `{}`, and `[]`, and every closing bracket must match the most recent unmatched opening bracket.',
    difficulty: 'Medium',
    topic: 'Stacks',
    javaStarterCode: `
import java.util.*;

class Solution {
    public boolean isValid(String text) {
        // Your solution here
        return false;
    }
}
    `,
    visibleTestCases: [
      { input: '({[]})', expectedOutput: 'true' },
      { input: '([)]', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: '(((())))', expectedOutput: 'true' },
      { input: '(((', expectedOutput: 'false' },
      { input: '{[()()]}[]', expectedOutput: 'true' },
    ],
    hints: [
      'A stack helps you remember the most recent opening bracket.',
      'When you see a closing bracket, it must match the current stack top.',
    ],
    execution: { type: 'validParentheses' },
  }),
  problem({
    problemId: 'medium-binary-search',
    title: 'Binary Search',
    description:
      'Return the index of the target value in a sorted array. If the target does not exist, return `-1`.',
    difficulty: 'Medium',
    topic: 'Searching',
    javaStarterCode: `
class Solution {
    public int binarySearch(int[] nums, int target) {
        // Your solution here
        return -1;
    }
}
    `,
    visibleTestCases: [
      { input: '1,3,5,6,7\n5', expectedOutput: '2' },
      { input: '2,4,6,8,10\n7', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: '5\n5', expectedOutput: '0' },
      { input: '-5,-2,0,3,9\n-2', expectedOutput: '1' },
      { input: '1,2,3,4,5,6,7,8\n8', expectedOutput: '7' },
    ],
    hints: [
      'Use two pointers to shrink the search range.',
      'Recompute the middle index every time you discard half the array.',
    ],
    execution: { type: 'binarySearch' },
  }),
  problem({
    problemId: 'medium-merge-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    description:
      'Merge two sorted integer arrays and return a new sorted array containing all values from both inputs. Preserve duplicates when they appear.',
    difficulty: 'Medium',
    topic: 'Arrays',
    javaStarterCode: `
class Solution {
    public int[] mergeSortedArrays(int[] nums1, int[] nums2) {
        // Your solution here
        return new int[]{};
    }
}
    `,
    visibleTestCases: [
      { input: '1,3,5\n2,4,6', expectedOutput: '1,2,3,4,5,6' },
      { input: '1,2,2\n2,3,4', expectedOutput: '1,2,2,2,3,4' },
    ],
    hiddenTestCases: [
      { input: '\n1,2,3', expectedOutput: '1,2,3' },
      { input: '-5,-1,7\n-3,2,8', expectedOutput: '-5,-3,-1,2,7,8' },
      { input: '4,9\n', expectedOutput: '4,9' },
    ],
    hints: [
      'Walk through both arrays with two indices and always take the smaller value next.',
      'After one array ends, append the remaining values from the other array.',
    ],
    execution: { type: 'mergeSortedArrays' },
  }),
  problem({
    problemId: 'medium-longest-common-prefix',
    title: 'Longest Common Prefix',
    description:
      'Find the longest prefix string shared by every string in the array. If no common prefix exists, return an empty string and the judge will print `<empty>`.',
    difficulty: 'Medium',
    topic: 'Strings',
    javaStarterCode: `
class Solution {
    public String longestCommonPrefix(String[] words) {
        // Your solution here
        return "";
    }
}
    `,
    visibleTestCases: [
      { input: 'flower,flow,flight', expectedOutput: 'fl' },
      { input: 'dog,racecar,car', expectedOutput: '<empty>' },
    ],
    hiddenTestCases: [
      { input: 'interview,internal,internet', expectedOutput: 'inter' },
      { input: 'throne,throne', expectedOutput: 'throne' },
      { input: 'a', expectedOutput: 'a' },
    ],
    hints: [
      'Start with one candidate prefix and shorten it when needed.',
      'Once the prefix becomes empty, you can stop immediately.',
    ],
    execution: { type: 'longestCommonPrefix' },
  }),
  problem({
    problemId: 'medium-power-of-two',
    title: 'Power of Two',
    description:
      'Return true if the integer is a power of two. Numbers less than or equal to zero should return false.',
    difficulty: 'Medium',
    topic: 'Bit Manipulation',
    javaStarterCode: `
class Solution {
    public boolean isPowerOfTwo(int n) {
        // Your solution here
        return false;
    }
}
    `,
    visibleTestCases: [
      { input: '16', expectedOutput: 'true' },
      { input: '18', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: 'true' },
      { input: '0', expectedOutput: 'false' },
      { input: '1024', expectedOutput: 'true' },
    ],
    hints: [
      'A power of two has exactly one bit set in binary form.',
      'Be careful with zero and negative values.',
    ],
    execution: { type: 'powerOfTwo' },
  }),
  problem({
    problemId: 'medium-rotate-array',
    title: 'Rotate Array',
    description:
      'Rotate the array to the right by `k` steps. Your method should modify the array in place, and the judge prints the final arrangement after the rotation.',
    difficulty: 'Medium',
    topic: 'Arrays',
    javaStarterCode: `
class Solution {
    public void rotate(int[] nums, int k) {
        // Your solution here
    }
}
    `,
    visibleTestCases: [
      { input: '1,2,3,4,5,6,7\n3', expectedOutput: '5,6,7,1,2,3,4' },
      { input: '-1,-100,3,99\n2', expectedOutput: '3,99,-1,-100' },
    ],
    hiddenTestCases: [
      { input: '1,2,3\n4', expectedOutput: '3,1,2' },
      { input: '8\n10', expectedOutput: '8' },
      { input: '0,1,2,3,4\n0', expectedOutput: '0,1,2,3,4' },
    ],
    hints: [
      'Reduce `k` with modulo before you start.',
      'Try reversing the whole array and then reversing two sections.',
    ],
    execution: { type: 'rotateArray' },
  }),
  problem({
    problemId: 'medium-missing-number',
    title: 'Missing Number',
    description:
      'The array contains `n` distinct numbers taken from the range `[0, n]`. Return the one missing value.',
    difficulty: 'Medium',
    topic: 'Arrays',
    javaStarterCode: `
class Solution {
    public int missingNumber(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '3,0,1', expectedOutput: '2' },
      { input: '0,1', expectedOutput: '2' },
    ],
    hiddenTestCases: [
      { input: '9,6,4,2,3,5,7,0,1', expectedOutput: '8' },
      { input: '1', expectedOutput: '0' },
      { input: '0', expectedOutput: '1' },
    ],
    hints: [
      'Compare the actual sum with the expected sum from `0` to `n`.',
      'XOR is another neat way to cancel matching values.',
    ],
    execution: { type: 'missingNumber' },
  }),
  problem({
    problemId: 'medium-single-number',
    title: 'Single Number',
    description:
      'Every value in the array appears exactly twice except for one value that appears once. Return the value that appears only once.',
    difficulty: 'Medium',
    topic: 'Bit Manipulation',
    javaStarterCode: `
class Solution {
    public int singleNumber(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '2,2,1', expectedOutput: '1' },
      { input: '4,1,2,1,2', expectedOutput: '4' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '-1,-1,-2', expectedOutput: '-2' },
      { input: '7,3,5,4,5,3,4', expectedOutput: '7' },
    ],
    hints: [
      'XOR removes pairs because `a ^ a = 0`.',
      'The remaining value after XOR-ing everything is the answer.',
    ],
    execution: { type: 'singleNumber' },
  }),
  problem({
    problemId: 'medium-maximum-subarray',
    title: 'Maximum Subarray (Kadane)',
    description:
      'Return the largest sum among all contiguous subarrays. The array contains at least one integer, and the best answer may be negative if all values are negative.',
    difficulty: 'Medium',
    topic: 'Dynamic Programming',
    javaStarterCode: `
class Solution {
    public int maxSubArray(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6' },
      { input: '1', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '5,4,-1,7,8', expectedOutput: '23' },
      { input: '-3,-2,-5,-1', expectedOutput: '-1' },
      { input: '2,-1,2,3,4,-5', expectedOutput: '10' },
    ],
    hints: [
      'At each position, decide whether to start fresh or extend the previous subarray.',
      'Track both the current best ending here and the global best answer.',
    ],
    execution: { type: 'maxSubarray' },
  }),
  problem({
    problemId: 'medium-first-last-position',
    title: 'First and Last Position',
    description:
      'Given a sorted array and a target value, return the first and last index where the target appears. If the target does not exist, return `-1,-1`.',
    difficulty: 'Medium',
    topic: 'Searching',
    javaStarterCode: `
class Solution {
    public int[] searchRange(int[] nums, int target) {
        // Your solution here
        return new int[]{-1, -1};
    }
}
    `,
    visibleTestCases: [
      { input: '5,7,7,8,8,10\n8', expectedOutput: '3,4' },
      { input: '5,7,7,8,8,10\n6', expectedOutput: '-1,-1' },
    ],
    hiddenTestCases: [
      { input: '2,2,2,2\n2', expectedOutput: '0,3' },
      { input: '1\n1', expectedOutput: '0,0' },
      { input: '1,3,3,3,5,7\n3', expectedOutput: '1,3' },
    ],
    hints: [
      'Use binary search twice: once for the left boundary and once for the right boundary.',
      'Do not stop after finding one match, because you still need the full range.',
    ],
    execution: { type: 'firstLastPosition' },
  }),
];

const hard = [
  problem({
    problemId: 'hard-lru-cache',
    title: 'LRU Cache',
    description:
      'Implement an LRU cache that supports `get` and `put` in O(1) average time. The input provides the cache capacity, a list of operations, and their arguments. Return the outputs for all operations, using `null` for each `put` call.',
    difficulty: 'Hard',
    topic: 'Design',
    javaStarterCode: `
import java.util.*;

class LRUCache {
    public LRUCache(int capacity) {
        // Your solution here
    }

    public int get(int key) {
        // Your solution here
        return -1;
    }

    public void put(int key, int value) {
        // Your solution here
    }
}
    `,
    visibleTestCases: [
      {
        input: '2\nput,put,get,put,get,get\n1 1;2 2;1;3 3;2;3',
        expectedOutput: 'null,null,1,null,-1,3',
      },
      {
        input: '1\nput,get,put,get,get\n2 1;2;3 2;2;3',
        expectedOutput: 'null,1,null,-1,2',
      },
    ],
    hiddenTestCases: [
      {
        input: '2\nput,put,put,get,get\n2 1;1 1;2 3;1;2',
        expectedOutput: 'null,null,null,1,3',
      },
      {
        input: '2\nput,put,get,put,get,get\n1 1;2 2;1;4 4;2;4',
        expectedOutput: 'null,null,1,null,-1,4',
      },
      {
        input: '3\nput,put,put,get,put,get,get,get\n1 10;2 20;3 30;2;4 40;1;3;4',
        expectedOutput: 'null,null,null,20,null,-1,30,40',
      },
    ],
    hints: [
      'You need both quick lookup by key and quick removal of the least recently used item.',
      'A hash map plus a doubly linked list is a classic approach.',
    ],
    execution: { type: 'lruCache' },
  }),
  problem({
    problemId: 'hard-serialize-deserialize-tree',
    title: 'Serialize and Deserialize Binary Tree',
    description:
      'Implement a `Codec` that can convert a binary tree to a string and rebuild the same tree from that string. The judge feeds a tree in level-order form and checks whether your round-trip serialization matches the canonical level-order output.',
    difficulty: 'Hard',
    topic: 'Trees',
    javaStarterCode: `
import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int val) {
        this.val = val;
    }
}

class Codec {
    public String serialize(TreeNode root) {
        // Your solution here
        return "";
    }

    public TreeNode deserialize(String data) {
        // Your solution here
        return null;
    }
}
    `,
    visibleTestCases: [
      { input: '1,2,3,null,null,4,5', expectedOutput: '1,2,3,null,null,4,5' },
      { input: '10,-2,7,null,8', expectedOutput: '10,-2,7,null,8' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '5,3,8,1,4,7,9', expectedOutput: '5,3,8,1,4,7,9' },
      { input: '2,null,3,null,4', expectedOutput: '2,null,3,null,4' },
    ],
    hints: [
      'Level-order traversal makes it straightforward to preserve null child positions.',
      'Your deserialize method should rebuild children in the same order they were written.',
    ],
    execution: { type: 'serializeDeserializeTree' },
  }),
  problem({
    problemId: 'hard-trapping-rain-water',
    title: 'Trapping Rain Water',
    description:
      'Given bar heights in an elevation map, compute how much water is trapped after raining. Each bar has width 1.',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    javaStarterCode: `
class Solution {
    public int trap(int[] height) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '0,1,0,2,1,0,1,3,2,1,2,1', expectedOutput: '6' },
      { input: '4,2,0,3,2,5', expectedOutput: '9' },
    ],
    hiddenTestCases: [
      { input: '2,0,2', expectedOutput: '2' },
      { input: '3,0,0,2,0,4', expectedOutput: '10' },
      { input: '1,2,3,4', expectedOutput: '0' },
    ],
    hints: [
      'The trapped water at each position depends on the tallest wall on both sides.',
      'A two-pointer solution can avoid building full left and right max arrays.',
    ],
    execution: { type: 'trappingRainWater' },
  }),
  problem({
    problemId: 'hard-word-break',
    title: 'Word Break',
    description:
      'Return true if the string can be segmented into one or more dictionary words. The dictionary is provided on the second line as a comma-separated list.',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    javaStarterCode: `
import java.util.*;

class Solution {
    public boolean wordBreak(String s, List<String> wordDict) {
        // Your solution here
        return false;
    }
}
    `,
    visibleTestCases: [
      { input: 'leetcode\nleet,code', expectedOutput: 'true' },
      { input: 'catsandog\ncats,dog,sand,and,cat', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: 'applepenapple\napple,pen', expectedOutput: 'true' },
      { input: 'aaaaaaa\naaaa,aaa', expectedOutput: 'true' },
      { input: 'enterapotentpot\nenter,a,potent,pot,ten', expectedOutput: 'true' },
    ],
    hints: [
      'Think about whether each prefix of the string can be formed from valid words.',
      'A boolean DP array where `dp[i]` means the prefix up to `i` is reachable works well.',
    ],
    execution: { type: 'wordBreak' },
  }),
  problem({
    problemId: 'hard-longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    description:
      'Return the longest palindromic substring inside the input string. The visible and hidden tests are chosen so the expected longest palindrome is unique.',
    difficulty: 'Hard',
    topic: 'Strings',
    javaStarterCode: `
class Solution {
    public String longestPalindrome(String s) {
        // Your solution here
        return "";
    }
}
    `,
    visibleTestCases: [
      { input: 'cbbd', expectedOutput: 'bb' },
      { input: 'forgeeksskeegfor', expectedOutput: 'geeksskeeg' },
    ],
    hiddenTestCases: [
      { input: 'abacdfgdcaba', expectedOutput: 'aba' },
      { input: 'banana', expectedOutput: 'anana' },
      { input: 'levelup', expectedOutput: 'level' },
    ],
    hints: [
      'Palindromes can expand around a single center or a gap between two centers.',
      'Dynamic programming is possible too, but center expansion is usually simpler here.',
    ],
    execution: { type: 'longestPalSubstring' },
  }),
  problem({
    problemId: 'hard-course-schedule',
    title: 'Course Schedule (Topological Sort)',
    description:
      'Given the number of courses and prerequisite pairs, return true if all courses can be finished. The second line lists pairs as `course,prerequisite` entries separated by semicolons.',
    difficulty: 'Hard',
    topic: 'Graphs',
    javaStarterCode: `
import java.util.*;

class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        // Your solution here
        return false;
    }
}
    `,
    visibleTestCases: [
      { input: '2\n1,0', expectedOutput: 'true' },
      { input: '2\n1,0;0,1', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: '4\n1,0;2,1;3,2', expectedOutput: 'true' },
      { input: '3\n0,1;1,2;2,0', expectedOutput: 'false' },
      { input: '5\n1,0;2,0;3,1;3,2;4,3', expectedOutput: 'true' },
    ],
    hints: [
      'A cycle means the schedule is impossible.',
      'Topological sorting with indegrees or DFS cycle detection both work.',
    ],
    execution: { type: 'courseSchedule' },
  }),
  problem({
    problemId: 'hard-number-of-islands',
    title: 'Number of Islands (BFS/DFS)',
    description:
      'Count how many islands appear in the grid, where `1` means land and `0` means water. The input uses semicolons to separate rows.',
    difficulty: 'Hard',
    topic: 'Graphs',
    javaStarterCode: `
class Solution {
    public int numIslands(char[][] grid) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '11110;11010;11000;00000', expectedOutput: '1' },
      { input: '11000;11000;00100;00011', expectedOutput: '3' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1' },
      { input: '000;000;000', expectedOutput: '0' },
      { input: '10101;01010;10101', expectedOutput: '8' },
    ],
    hints: [
      'Whenever you find unvisited land, explore the full component and increment the island count.',
      'Mark visited cells so you do not count the same island twice.',
    ],
    execution: { type: 'numIslands' },
  }),
  problem({
    problemId: 'hard-minimum-path-sum',
    title: 'Minimum Path Sum (Grid DP)',
    description:
      'Find the minimum path sum from the top-left cell to the bottom-right cell in the grid. You may move only right or down.',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    javaStarterCode: `
class Solution {
    public int minPathSum(int[][] grid) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '1,3,1;1,5,1;4,2,1', expectedOutput: '7' },
      { input: '1,2,3;4,5,6', expectedOutput: '12' },
    ],
    hiddenTestCases: [
      { input: '5', expectedOutput: '5' },
      { input: '1,1,1;1,1,1;1,1,1', expectedOutput: '5' },
      { input: '9,1,4;6,2,8;5,3,7', expectedOutput: '22' },
    ],
    hints: [
      'The best path to a cell depends only on the best path from the top or the left.',
      'You can update a DP table row by row.',
    ],
    execution: { type: 'minPathSum' },
  }),
  problem({
    problemId: 'hard-decode-ways',
    title: 'Decode Ways',
    description:
      'A string of digits maps to letters using `1 -> A` through `26 -> Z`. Return how many valid ways the full string can be decoded.',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    javaStarterCode: `
class Solution {
    public int numDecodings(String s) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '12', expectedOutput: '2' },
      { input: '226', expectedOutput: '3' },
    ],
    hiddenTestCases: [
      { input: '06', expectedOutput: '0' },
      { input: '11106', expectedOutput: '2' },
      { input: '27', expectedOutput: '1' },
    ],
    hints: [
      'Check one-digit and two-digit choices ending at each position.',
      'A leading zero can never start a valid decoding.',
    ],
    execution: { type: 'decodeWays' },
  }),
  problem({
    problemId: 'hard-jump-game-ii',
    title: 'Jump Game II',
    description:
      'Each array element tells you the maximum jump length from that position. Return the minimum number of jumps needed to reach the last index.',
    difficulty: 'Hard',
    topic: 'Greedy',
    javaStarterCode: `
class Solution {
    public int jump(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '2,3,1,1,4', expectedOutput: '2' },
      { input: '2,3,0,1,4', expectedOutput: '2' },
    ],
    hiddenTestCases: [
      { input: '1,1,1,1', expectedOutput: '3' },
      { input: '4,1,1,3,1,1,1', expectedOutput: '2' },
      { input: '1', expectedOutput: '0' },
    ],
    hints: [
      'Track the farthest index reachable within the current jump window.',
      'When you reach the end of the current window, you must spend one jump and expand it.',
    ],
    execution: { type: 'jumpGameTwo' },
  }),
  problem({
    problemId: 'hard-container-most-water',
    title: 'Container With Most Water',
    description:
      'Choose two lines that, together with the x-axis, can contain the maximum amount of water. Return the maximum area.',
    difficulty: 'Hard',
    topic: 'Two Pointers',
    javaStarterCode: `
class Solution {
    public int maxArea(int[] height) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '1,8,6,2,5,4,8,3,7', expectedOutput: '49' },
      { input: '1,1', expectedOutput: '1' },
    ],
    hiddenTestCases: [
      { input: '4,3,2,1,4', expectedOutput: '16' },
      { input: '1,2,1', expectedOutput: '2' },
      { input: '2,3,10,5,7,8,9', expectedOutput: '36' },
    ],
    hints: [
      'The width shrinks every time you move a pointer, so move the shorter wall hoping to find a taller one.',
      'Checking every pair is too slow for large arrays.',
    ],
    execution: { type: 'containerMostWater' },
  }),
  problem({
    problemId: 'hard-three-sum',
    title: '3Sum',
    description:
      'Return all unique triplets whose sum is zero. The judge expects a canonical output where each triplet is sorted ascending and triplets are ordered lexicographically. If no triplet exists, print `<empty>`.',
    difficulty: 'Hard',
    topic: 'Arrays',
    javaStarterCode: `
import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        // Your solution here
        return new ArrayList<>();
    }
}
    `,
    visibleTestCases: [
      { input: '-1,0,1,2,-1,-4', expectedOutput: '[-1,-1,2];[-1,0,1]' },
      { input: '0,1,1', expectedOutput: '<empty>' },
    ],
    hiddenTestCases: [
      { input: '0,0,0', expectedOutput: '[0,0,0]' },
      { input: '-2,0,0,2,2', expectedOutput: '[-2,0,2]' },
      { input: '-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6', expectedOutput: '[-4,-2,6];[-4,0,4];[-4,1,3];[-4,2,2];[-2,-2,4];[-2,0,2]' },
    ],
    hints: [
      'Sort the array first so you can use a two-pointer sweep for each fixed first element.',
      'Skip duplicate values carefully so you do not repeat triplets.',
    ],
    execution: { type: 'threeSum' },
  }),
  problem({
    problemId: 'hard-longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence (DP)',
    description:
      'Return the length of the longest strictly increasing subsequence in the array. The subsequence does not need to be contiguous.',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    javaStarterCode: `
class Solution {
    public int lengthOfLIS(int[] nums) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '10,9,2,5,3,7,101,18', expectedOutput: '4' },
      { input: '0,1,0,3,2,3', expectedOutput: '4' },
    ],
    hiddenTestCases: [
      { input: '7,7,7,7,7', expectedOutput: '1' },
      { input: '4,10,4,3,8,9', expectedOutput: '3' },
      { input: '1,3,6,7,9,4,10,5,6', expectedOutput: '6' },
    ],
    hints: [
      'A quadratic DP works, but there is also a faster patience-sorting style solution.',
      'The state can represent the best increasing subsequence ending at each index.',
    ],
    execution: { type: 'lis' },
  }),
  problem({
    problemId: 'hard-edit-distance',
    title: 'Edit Distance',
    description:
      'Return the minimum number of insertions, deletions, and replacements needed to convert the first string into the second string.',
    difficulty: 'Hard',
    topic: 'Dynamic Programming',
    javaStarterCode: `
class Solution {
    public int minDistance(String word1, String word2) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: 'horse\nros', expectedOutput: '3' },
      { input: 'intention\nexecution', expectedOutput: '5' },
    ],
    hiddenTestCases: [
      { input: '\nabc', expectedOutput: '3' },
      { input: 'kitten\nsitting', expectedOutput: '3' },
      { input: 'algorithm\naltruistic', expectedOutput: '6' },
    ],
    hints: [
      'Build a DP table where each cell compares prefixes of the two words.',
      'When the current characters differ, consider insert, delete, and replace.',
    ],
    execution: { type: 'editDistance' },
  }),
  problem({
    problemId: 'hard-binary-tree-maximum-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    description:
      'Return the maximum path sum in the binary tree. A valid path can start and end at any nodes, but it must always move through parent-child connections.',
    difficulty: 'Hard',
    topic: 'Trees',
    javaStarterCode: `
class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;

    TreeNode(int val) {
        this.val = val;
    }
}

class Solution {
    public int maxPathSum(TreeNode root) {
        // Your solution here
        return 0;
    }
}
    `,
    visibleTestCases: [
      { input: '1,2,3', expectedOutput: '6' },
      { input: '-10,9,20,null,null,15,7', expectedOutput: '42' },
    ],
    hiddenTestCases: [
      { input: '2,-1', expectedOutput: '2' },
      { input: '5,4,8,11,null,13,4,7,2,null,null,null,1', expectedOutput: '48' },
      { input: '-3', expectedOutput: '-3' },
    ],
    hints: [
      'Each recursive call should return the best downward path starting from that node.',
      'Update a global answer with the sum of left gain, node value, and right gain.',
    ],
    execution: { type: 'binaryTreeMaxPathSum' },
  }),
  problem({
    problemId: 'hard-median-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    description:
      'Return the median of the two sorted arrays. The output should be printed as a decimal only when needed, such as `2.5`.',
    difficulty: 'Hard',
    topic: 'Searching',
    javaStarterCode: `
class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Your solution here
        return 0.0;
    }
}
    `,
    visibleTestCases: [
      { input: '1,3\n2', expectedOutput: '2' },
      { input: '1,2\n3,4', expectedOutput: '2.5' },
    ],
    hiddenTestCases: [
      { input: '0,0\n0,0', expectedOutput: '0' },
      { input: '\n1', expectedOutput: '1' },
      { input: '2\n', expectedOutput: '2' },
    ],
    hints: [
      'Think about partitioning the two arrays so the left halves and right halves are balanced.',
      'A binary search on the smaller array leads to the optimal logarithmic solution.',
    ],
    execution: { type: 'medianTwoSortedArrays' },
  }),
];

module.exports = {
  basic,
  medium,
  hard,
};
