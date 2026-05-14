// server/services/diagnosticGenerator.js
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const MCQ = require('../models/MCQ');
const Topic = require('../models/Topic');
const {
  classifyLevel,
  buildDiagnosticPerformanceData,
} = require('./mlService');

/* ================================================================
   Fallback question bank – 10 per topic (100 total)
   These are Java‑specific DSA MCQs.
   ================================================================ */
const FALLBACK_BANK = {
  arrays: [
    { q: "In Java, what is the default value of an element in an int array?", opts: ["0", "null", "undefined", "-1"], correct: 0, exp: "Primitive int arrays are automatically initialised to 0.", limit: 30 },
    { q: "Which method is used to get the length of an array in Java?", opts: [".size()", ".length()", ".length", ".getSize()"], correct: 2, exp: "Arrays have a 'length' property, not a method.", limit: 30 },
    { q: "What does ArrayList<Integer> guarantee over int[]?", opts: ["Faster access", "Dynamic resizing", "Less memory", "None"], correct: 1, exp: "ArrayList can grow and shrink dynamically.", limit: 30 },
    { q: "How do you declare a 2D array with 3 rows and 4 columns in Java?", opts: ["int[3][4] arr;", "int[][] arr = new int[3][4];", "int arr[3,4];", "int[][] arr = int[3][4];"], correct: 1, exp: "Correct syntax: int[][] arr = new int[3][4];", limit: 30 },
    { q: "What is the time complexity of accessing an element by index in an ArrayList?", opts: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0, exp: "ArrayList is backed by an array, giving O(1) random access.", limit: 30 },
    { q: "Which of these correctly creates an ArrayList of integers?", opts: ["new ArrayList<int>()", "new ArrayList<Integer>()", "new ArrayList<>()", "Both B and C"], correct: 3, exp: "Generics don't allow primitives, so both Integer and diamond operator work.", limit: 30 },
    { q: "What happens if you try to access arr[5] in an array of size 5?", opts: ["Returns null", "Returns 0", "Throws ArrayIndexOutOfBoundsException", "Returns the last element"], correct: 2, exp: "Valid indices are 0‑4; index 5 throws an exception.", limit: 30 },
    { q: "Which algorithm finds the maximum subarray sum in O(n)?", opts: ["Brute force", "Divide and conquer", "Kadane's algorithm", "Two-pointer"], correct: 2, exp: "Kadane's algorithm maintains a running sum and resets when negative.", limit: 30 },
    { q: "What is a prefix sum array used for?", opts: ["Sorting", "Range sum queries in O(1)", "Finding duplicates", "Compressing the array"], correct: 1, exp: "Prefix sums allow O(1) range sum queries.", limit: 30 },
    { q: "In the two‑pointer technique on a sorted array, where do the pointers start?", opts: ["Both at start", "One at start, one at end", "Both at end", "Random"], correct: 1, exp: "One pointer at index 0, the other at n‑1.", limit: 30 },
  ],
  strings: [
    { q: "In Java, which class is immutable?", opts: ["StringBuilder", "StringBuffer", "String", "All"], correct: 2, exp: "String objects are immutable.", limit: 30 },
    { q: "What does str.substring(2,5) return for 'abcdef'?", opts: ["'cde'", "'cdef'", "'bcd'", "'bcde'"], correct: 0, exp: "substring(begin, end) returns characters from index 2 to 4 inclusive.", limit: 30 },
    { q: "How do you compare two strings ignoring case?", opts: ["==", "equals()", "equalsIgnoreCase()", "compareTo()"], correct: 2, exp: "equalsIgnoreCase() ignores case differences.", limit: 30 },
    { q: "What is the output of: String s1 = \"hello\"; String s2 = \"hello\"; System.out.println(s1 == s2);", opts: ["true", "false", "compiler error", "runtime error"], correct: 0, exp: "Both literals point to the same String pool object.", limit: 30 },
    { q: "Which method returns the number of characters in a String?", opts: [".length()", ".size()", ".count()", ".capacity()"], correct: 0, exp: "Strings use .length() method.", limit: 30 },
    { q: "What is the main difference between StringBuilder and StringBuffer?", opts: ["Thread safety", "Speed", "StringBuilder is immutable", "Both A and B"], correct: 3, exp: "StringBuffer is thread‑safe (synchronised), StringBuilder is faster but not thread‑safe.", limit: 30 },
    { q: "How many objects are created by: String s = new String(\"java\");", opts: ["0", "1", "2", "3"], correct: 2, exp: "One in the pool (\"java\") and one on the heap (new String).", limit: 30 },
    { q: "Which of the following checks if a string is a palindrome?", opts: ["Compare ends moving inward", "Sort the string", "Use KMP", "Count frequencies only"], correct: 0, exp: "Two‑pointer from both ends is the standard O(n) palindrome check.", limit: 30 },
    { q: "What does the KMP algorithm improve over naive pattern matching?", opts: ["Time from O(n*m) to O(n+m)", "Space from O(1) to O(n)", "Simplifies code", "None"], correct: 0, exp: "KMP preprocesses the pattern to avoid backtracking.", limit: 30 },
    { q: "Two strings are anagrams if:", opts: ["Same length", "Same characters in same order", "Same characters with same frequencies", "Palindromes"], correct: 2, exp: "Anagrams have identical character frequencies.", limit: 30 },
  ],
  searching: [
    { q: "What is the prerequisite for binary search?", opts: ["Sorted array", "Unsorted array", "Linked list", "HashMap"], correct: 0, exp: "Binary search requires the data to be sorted.", limit: 30 },
    { q: "Which searching algorithm is also called sequential search?", opts: ["Binary search", "Linear search", "Jump search", "Exponential search"], correct: 1, exp: "Linear search scans elements one by one.", limit: 30 },
    { q: "What is the time complexity of binary search?", opts: ["O(n)", "O(n^2)", "O(log n)", "O(1)"], correct: 2, exp: "Binary search divides the search space in half each step.", limit: 30 },
    { q: "What is the worst‑case time complexity of linear search?", opts: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: 1, exp: "In worst case, linear search checks all n elements.", limit: 30 },
    { q: "How is the middle index correctly calculated to avoid overflow?", opts: ["(low + high) / 2", "low + (high - low) / 2", "high - low / 2", "(low + high) >> 1"], correct: 1, exp: "low + (high‑low)/2 prevents integer overflow.", limit: 30 },
    { q: "What is the best‑case time complexity of linear search?", opts: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0, exp: "Best case: target is at the first position.", limit: 30 },
    { q: "When is linear search preferred over binary search?", opts: ["Sorted array", "Small or unsorted array", "Large array", "Always"], correct: 1, exp: "If the array is small or unsorted, linear search is simpler.", limit: 30 },
    { q: "Ternary search divides the array into how many parts?", opts: ["2", "3", "4", "5"], correct: 1, exp: "Ternary search splits into three parts using two midpoints.", limit: 30 },
    { q: "What is the optimal block size for jump search?", opts: ["n", "√n", "log n", "n/2"], correct: 1, exp: "Jump search works best with a step size of √n.", limit: 30 },
    { q: "Exponential search first finds a range, then performs:", opts: ["Linear search", "Binary search", "Ternary search", "Jump search"], correct: 1, exp: "Exponential search doubles the range then binary searches within it.", limit: 30 },
  ],
  sorting: [
    { q: "Which sorting algorithm repeatedly swaps adjacent elements?", opts: ["Selection sort", "Insertion sort", "Bubble sort", "Merge sort"], correct: 2, exp: "Bubble sort compares and swaps adjacent elements.", limit: 30 },
    { q: "What is the worst‑case time of bubble sort?", opts: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 2, exp: "Bubble sort requires nested loops, giving O(n²).", limit: 30 },
    { q: "Selection sort works by:", opts: ["Swapping adjacent", "Finding minimum and placing at start", "Inserting each element", "Divide and conquer"], correct: 1, exp: "Selection sort selects the smallest element and swaps it to the front.", limit: 30 },
    { q: "Insertion sort is efficient for:", opts: ["Large random arrays", "Nearly sorted arrays", "Reverse sorted", "All equally"], correct: 1, exp: "Insertion sort has O(n) best case for nearly sorted data.", limit: 30 },
    { q: "Which of these is a stable sorting algorithm?", opts: ["Selection sort", "Quick sort (naive)", "Bubble sort", "Heap sort"], correct: 2, exp: "Bubble sort is stable – it preserves relative order of equal elements.", limit: 30 },
    { q: "Merge sort uses which paradigm?", opts: ["Greedy", "Dynamic programming", "Divide and conquer", "Backtracking"], correct: 2, exp: "Merge sort divides, recursively sorts, and merges.", limit: 30 },
    { q: "What is the worst‑case time of merge sort?", opts: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correct: 1, exp: "Merge sort guarantees O(n log n) in all cases.", limit: 30 },
    { q: "Quick sort's worst case occurs with:", opts: ["Random array", "Already sorted array with first/last pivot", "All equal elements", "Both B and C"], correct: 3, exp: "Poor pivot choice or all equal elements degrade quick sort to O(n²).", limit: 30 },
    { q: "Which sorting algorithm is used by Arrays.sort() for primitives?", opts: ["Merge sort", "Quick sort (dual‑pivot)", "Bubble sort", "Insertion sort"], correct: 1, exp: "Java uses Dual‑Pivot Quicksort for primitive arrays.", limit: 30 },
    { q: "Counting sort is most efficient when:", opts: ["Range is small vs. elements", "Array is large", "Nearly sorted", "Floats"], correct: 0, exp: "Counting sort works in O(n+k) where k is the range.", limit: 30 },
  ],
  recursion: [
    { q: "What can cause a StackOverflowError in recursion?", opts: ["Missing base case", "Too many iterations", "Large arrays", "Using loops"], correct: 0, exp: "Without a base case, recursion continues indefinitely.", limit: 30 },
    { q: "In recursion, what is the part that calls itself?", opts: ["Base case", "Recursive case", "Termination condition", "Memoization"], correct: 1, exp: "The recursive case contains the self‑referencing call.", limit: 30 },
    { q: "What is tail recursion?", opts: ["Recursion with a tail", "Recursive call is the last operation", "Recursion without base case", "Recursion using loops"], correct: 1, exp: "In tail recursion, the recursive call is the final action.", limit: 30 },
    { q: "What is the output of factorial(5) where factorial(n) = n * factorial(n‑1), base case n<=1?", opts: ["25", "120", "5", "15"], correct: 1, exp: "5! = 5×4×3×2×1 = 120.", limit: 30 },
    { q: "In the call stack during recursion, which call is at the bottom?", opts: ["Base case", "First/initial call", "Most recent", "All at same level"], correct: 1, exp: "The first call is at the bottom; each recursive call pushes on top.", limit: 30 },
    { q: "Recursion is often used as an alternative to:", opts: ["Sorting", "Iteration (loops)", "Hashing", "Graph algorithms only"], correct: 1, exp: "Recursion can replace iterative loops for recursive structures.", limit: 30 },
    { q: "In Tower of Hanoi with n disks, what is the minimum moves?", opts: ["n", "2^n", "2^n - 1", "n!"], correct: 2, exp: "Minimum moves = 2^n - 1.", limit: 30 },
    { q: "How many subsets does a set of n elements have?", opts: ["n", "2^n", "n²", "n!"], correct: 1, exp: "Each element can be included or excluded, giving 2^n subsets.", limit: 30 },
    { q: "Memoization in recursion helps by:", opts: ["Eliminating base case", "Storing results to avoid recomputation", "Increasing depth", "Making code shorter"], correct: 1, exp: "Memoization caches results of function calls to avoid redundant work.", limit: 30 },
    { q: "The recursive solution for generating all subsets has what time complexity?", opts: ["O(n)", "O(2^n)", "O(n²)", "O(n log n)"], correct: 1, exp: "Generating all 2^n subsets requires O(2^n) time.", limit: 30 },
  ],
  linked_lists: [
    { q: "In a singly linked list, what does each node contain?", opts: ["Data and next pointer", "Data and previous pointer", "Only data", "Data and index"], correct: 0, exp: "Singly linked list node stores data and a reference to the next node.", limit: 30 },
    { q: "What is the time complexity to insert at the head of a linked list?", opts: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], correct: 2, exp: "Head insertion only requires updating the head pointer.", limit: 30 },
    { q: "Which Java class implements a doubly‑linked list?", opts: ["ArrayList", "LinkedList", "Vector", "HashSet"], correct: 1, exp: "java.util.LinkedList implements a doubly‑linked list.", limit: 30 },
    { q: "To delete a node from a singly linked list, you need:", opts: ["Only the node", "Node before the one to delete", "Node after", "All nodes"], correct: 1, exp: "You need the previous node to update its next pointer.", limit: 30 },
    { q: "What is the time complexity of searching in a singly linked list?", opts: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correct: 1, exp: "Linked lists do not support random access; search is O(n).", limit: 30 },
    { q: "Reversing a singly linked list in‑place can be done in:", opts: ["O(1) time", "O(n) time O(1) space", "O(n²) time", "O(n) time O(n) space"], correct: 1, exp: "Use three pointers to reverse in O(n) time with O(1) extra space.", limit: 30 },
    { q: "A doubly linked list node has:", opts: ["Data and next", "Data, prev, and next", "Only data", "Data and two next pointers"], correct: 1, exp: "A doubly linked list node stores data, a previous pointer, and a next pointer.", limit: 30 },
    { q: "What is the key advantage of a doubly linked list over singly?", opts: ["Less memory", "Faster insertion", "Bidirectional traversal", "No advantage"], correct: 2, exp: "Doubly linked lists can be traversed forward and backward.", limit: 30 },
    { q: "In a circular singly linked list, the last node points to:", opts: ["null", "itself", "the head", "the second node"], correct: 2, exp: "The last node's next points to the head, forming a cycle.", limit: 30 },
    { q: "Floyd's cycle detection algorithm uses:", opts: ["One pointer", "Two pointers (slow & fast)", "Three pointers", "Hash table"], correct: 1, exp: "Floyd's algorithm uses a slow pointer (1 step) and a fast pointer (2 steps).", limit: 30 },
  ],
  stack_queue: [
    { q: "Which data structure follows LIFO?", opts: ["Queue", "Stack", "Array", "Linked list"], correct: 1, exp: "Stack operates on Last‑In‑First‑Out principle.", limit: 30 },
    { q: "Queue follows which principle?", opts: ["LIFO", "FIFO", "Random access", "Priority‑based"], correct: 1, exp: "Queue is First‑In‑First‑Out.", limit: 30 },
    { q: "What is the Java class for a stack?", opts: ["Stack", "ArrayDeque", "LinkedList", "PriorityQueue"], correct: 1, exp: "ArrayDeque is preferred over the legacy Stack class.", limit: 30 },
    { q: "Which interface does Java provide for Queue?", opts: ["java.util.Stack", "java.util.Queue", "java.util.List", "java.util.Set"], correct: 1, exp: "java.util.Queue is an interface extending Collection.", limit: 30 },
    { q: "What is the time complexity of push and pop on a stack?", opts: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 0, exp: "Both push and pop are O(1) operations.", limit: 30 },
    { q: "BFS uses which data structure?", opts: ["Stack", "Queue", "Heap", "Tree"], correct: 1, exp: "BFS uses a queue to explore nodes level by level.", limit: 30 },
    { q: "Which of the following is NOT a stack application?", opts: ["Function call management", "Undo/Redo", "BFS graph traversal", "Expression evaluation"], correct: 2, exp: "BFS uses a queue, not a stack.", limit: 30 },
    { q: "What is a monotonic stack used for?", opts: ["Sorting", "Finding next greater/smaller element in O(n)", "Hashing", "Tree traversal"], correct: 1, exp: "A monotonic stack maintains elements in increasing or decreasing order.", limit: 30 },
    { q: "Deque stands for:", opts: ["Double‑Ended Queue", "Delayed Queue", "Distributed Queue", "Dynamic Queue"], correct: 0, exp: "Deque allows insertion and deletion at both ends.", limit: 30 },
    { q: "PriorityQueue in Java is implemented using:", opts: ["Array", "Linked list", "Binary heap", "Balanced BST"], correct: 2, exp: "Java's PriorityQueue is backed by a binary heap.", limit: 30 },
  ],
  trees: [
    { q: "Which traversal visits the root node first?", opts: ["Inorder", "Preorder", "Postorder", "Level order"], correct: 1, exp: "Preorder traversal visits root, then left, then right.", limit: 30 },
    { q: "What is the maximum number of children in a binary tree node?", opts: ["1", "2", "3", "Unlimited"], correct: 1, exp: "A binary tree node can have at most two children.", limit: 30 },
    { q: "Which data structure is used for level order traversal?", opts: ["Stack", "Queue", "Array", "HashMap"], correct: 1, exp: "Level order traversal uses a queue.", limit: 30 },
    { q: "In a BST, for any node, all values in the left subtree are:", opts: ["Greater", "Less", "Equal", "Any"], correct: 1, exp: "BST property: left subtree values are less than the node.", limit: 30 },
    { q: "What is the worst‑case time complexity of search in a BST?", opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correct: 2, exp: "If the BST is skewed, search degrades to O(n).", limit: 30 },
    { q: "Inorder traversal of a BST produces:", opts: ["Random order", "Sorted ascending", "Reverse sorted", "Level order"], correct: 1, exp: "Inorder traversal visits nodes in sorted ascending order.", limit: 30 },
    { q: "When deleting a node with two children in a BST, replace with:", opts: ["Left child", "Right child", "Inorder successor", "Random node"], correct: 2, exp: "Replace with the smallest node in the right subtree (inorder successor).", limit: 30 },
    { q: "How to check if a binary tree is a valid BST?", opts: ["Check left < root < right only", "Inorder traversal and verify sorted order", "Check height", "Count nodes"], correct: 1, exp: "Inorder traversal of a valid BST yields a sorted list.", limit: 30 },
    { q: "What is the height of a single‑node tree?", opts: ["-1", "0", "1", "2"], correct: 1, exp: "The height of a single‑node tree is 0 (edges).", limit: 30 },
    { q: "Postorder traversal is useful for:", opts: ["Printing sorted", "Deleting a tree (children first)", "Finding root", "Creating a copy"], correct: 1, exp: "Postorder visits children before the parent, ideal for safe deletion.", limit: 30 },
  ],
  graphs: [
    { q: "What is an adjacency matrix?", opts: ["List of edges", "2D array representing connections", "Linked list of vertices", "Tree"], correct: 1, exp: "Adjacency matrix uses a V×V matrix where cell[i][j] indicates an edge.", limit: 30 },
    { q: "Which algorithm solves single‑source shortest path?", opts: ["DFS", "BFS", "Dijkstra's", "Kruskal's"], correct: 2, exp: "Dijkstra's algorithm finds shortest paths from a single source.", limit: 30 },
    { q: "What is a cycle in a graph?", opts: ["Path that starts and ends at same vertex", "Disconnected component", "Bridge edge", "None"], correct: 0, exp: "A cycle is a path where the first and last vertices are the same.", limit: 30 },
    { q: "Which representation is more space‑efficient for a sparse graph?", opts: ["Adjacency matrix", "Adjacency list", "Both equal", "Edge matrix"], correct: 1, exp: "Adjacency list uses O(V+E) space, better for sparse graphs.", limit: 30 },
    { q: "In a directed graph, edge (u, v) means:", opts: ["Bidirectional", "Connection from u to v only", "From v to u only", "No connection"], correct: 1, exp: "In a directed graph, edges have direction; (u,v) goes from u to v.", limit: 30 },
    { q: "BFS uses which data structure?", opts: ["Stack", "Queue", "Heap", "Tree"], correct: 1, exp: "BFS uses a queue to explore vertices level by level.", limit: 30 },
    { q: "DFS uses which data structure?", opts: ["Queue", "Stack (or recursion)", "Heap", "Priority queue"], correct: 1, exp: "DFS uses a stack (explicitly or via recursion).", limit: 30 },
    { q: "What is the time complexity of BFS and DFS for adjacency list?", opts: ["O(V)", "O(V+E)", "O(V²)", "O(E log V)"], correct: 1, exp: "Both visit each vertex and edge once, giving O(V+E).", limit: 30 },
    { q: "Topological sorting is possible only for:", opts: ["Undirected graphs", "DAGs", "Cyclic graphs", "Weighted graphs"], correct: 1, exp: "Topological sorting requires a Directed Acyclic Graph.", limit: 30 },
    { q: "Dijkstra's algorithm works with:", opts: ["Negative weights", "Non‑negative weights only", "Any weights", "Unweighted only"], correct: 1, exp: "Dijkstra requires non‑negative edge weights.", limit: 30 },
  ],
  dp: [
    { q: "What does memoization do in DP?", opts: ["Stores results of expensive calls", "Removes recursion", "Solves greedy problems", "Uses heaps"], correct: 0, exp: "Memoization caches computed values to avoid redundant calculations.", limit: 30 },
    { q: "Which is a classic DP problem?", opts: ["Linear search", "0/1 Knapsack", "Binary search", "Stack sorting"], correct: 1, exp: "0/1 Knapsack is a classic DP problem.", limit: 30 },
    { q: "What is overlapping subproblems?", opts: ["Never reused", "Solved multiple times", "No optimal substructure", "None"], correct: 1, exp: "Overlapping subproblems occur when the same subproblem is solved repeatedly.", limit: 30 },
    { q: "Top‑down DP is also known as:", opts: ["Tabulation", "Memoization", "Iteration", "Greedy"], correct: 1, exp: "Top‑down DP uses memoization.", limit: 30 },
    { q: "Bottom‑up DP typically uses:", opts: ["Recursion", "Iteration filling a table", "Divide and conquer", "Greedy choice"], correct: 1, exp: "Tabulation builds solutions iteratively from base cases.", limit: 30 },
    { q: "What is the time complexity of Fibonacci using DP memoization?", opts: ["O(2^n)", "O(n)", "O(n²)", "O(log n)"], correct: 1, exp: "With memoization, each Fibonacci number is computed once, O(n).", limit: 30 },
    { q: "Space optimization for 2D DP often uses:", opts: ["3D array", "Two 1D arrays", "HashMap", "Full 2D table always"], correct: 1, exp: "Many 2D DP problems can be optimised to O(min(m,n)) space using two rows.", limit: 30 },
    { q: "Edit distance between two strings measures:", opts: ["Common characters", "Min insert/delete/substitute to convert", "Length difference", "Words"], correct: 1, exp: "Levenshtein distance counts the minimum operations to transform one string into another.", limit: 30 },
    { q: "In grid DP (unique paths), the recurrence dp[i][j] depends on:", opts: ["dp[i][j+1] only", "dp[i-1][j] and dp[i][j-1]", "All previous", "dp[0][0] only"], correct: 1, exp: "dp[i][j] = dp[i‑1][j] + dp[i][j‑1] (from above and left).", limit: 30 },
    { q: "In 0/1 knapsack, each item can be:", opts: ["Used multiple times", "Used at most once", "Used exactly twice", "Split"], correct: 1, exp: "0/1 knapsack: each item can be taken (1) or left (0).", limit: 30 },
  ],
};

/* ================================================================
   Seeded random number generator (mulberry32)
   ================================================================ */
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ================================================================
   Shuffle an array using a seeded RNG
   ================================================================ */
function seededShuffle(array, rng) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ================================================================
   DiagnosticGenerator class
   ================================================================ */
class DiagnosticGenerator {
  constructor() {
    this.activeSessions = new Map();
    this.DSA_TOPICS = [
      'arrays', 'strings', 'searching', 'sorting', 'recursion',
      'linked_lists', 'stack_queue', 'trees', 'graphs', 'dp',
    ];
  }

  /* ---------------------------------------------------------------
     Create a new diagnostic session.
     Builds a plan of 2 unique questions per topic, randomly chosen
     from the fallback bank using a seed derived from the token.
     Returns session token, total questions, expiry.
  --------------------------------------------------------------- */
  createSession(userId) {
    const token = uuidv4();
    // Create a numeric seed from the token (first 8 hex chars)
    const seed = parseInt(token.replace(/-/g, '').slice(0, 8), 16) || 0;
    const rng = mulberry32(seed);

    const plan = [];
    for (const topic of this.DSA_TOPICS) {
      const bank = FALLBACK_BANK[topic];
      if (!bank) continue;
      // Randomly select 2 distinct question indices for this topic
      const indices = seededShuffle([...Array(bank.length).keys()], rng).slice(0, 2);
      for (const idx of indices) {
        plan.push({ topic, questionIndex: idx });
      }
    }
    // Shuffle the overall order (so topics are interleaved)
    const shuffledPlan = seededShuffle(plan, rng);

    const session = {
      userId,
      createdAt: Date.now(),
      plan: shuffledPlan,
      currentIndex: 0,
      currentCorrectIndex: null,
      currentTimeLimit: 30,
      answers: [],
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    };

    this.activeSessions.set(token, session);

    // Auto‑delete after 30 minutes
    setTimeout(() => this.activeSessions.delete(token), 30 * 60 * 1000);

    return {
      token,
      totalQuestions: shuffledPlan.length,
      expiresIn: 1800,
    };
  }

  /* ---------------------------------------------------------------
     Generate the next question (OpenAI or fallback).
     Stores correct answer in session memory only.
  --------------------------------------------------------------- */
  async generateNextQuestion(token) {
    const session = this.activeSessions.get(token);
    if (!session) throw new Error('Session not found');
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      throw new Error('Session expired');
    }
    if (session.currentIndex >= session.plan.length) {
      throw new Error('All questions already answered');
    }

    const spec = session.plan[session.currentIndex];
    const { topic, questionIndex } = spec;
    const subtopic = `subtopic for ${topic}`; // Not used for fallback, but could be for AI prompt

    // Try OpenAI first if API key exists
    if (process.env.OPENAI_API_KEY) {
      try {
        const q = await this._generateWithOpenAI(topic, token);
        const { shuffledOptions, newCorrectIndex } = this._shuffleOptions(q.options, q.correctIndex, token);
        session.currentCorrectIndex = newCorrectIndex;
        session.currentTimeLimit = q.timeLimit || 30;
        return {
          questionNumber: session.currentIndex + 1,
          totalQuestions: session.plan.length,
          topic,
          question: q.question,
          options: shuffledOptions,
          timeLimit: session.currentTimeLimit,
        };
      } catch (err) {
        console.error('OpenAI failed, falling back to bank:', err.message);
      }
    }

    // Fallback to pre‑written bank
    const bank = FALLBACK_BANK[topic];
    const questionObj = bank[questionIndex % bank.length];
    const { shuffledOptions, newCorrectIndex } = this._shuffleOptions(questionObj.opts, questionObj.correct, token);
    session.currentCorrectIndex = newCorrectIndex;
    session.currentTimeLimit = questionObj.limit;

    return {
      questionNumber: session.currentIndex + 1,
      totalQuestions: session.plan.length,
      topic,
      question: questionObj.q,
      options: shuffledOptions,
      timeLimit: session.currentTimeLimit,
    };
  }

  /* ---------------------------------------------------------------
     Submit an answer for the current question.
  --------------------------------------------------------------- */
  submitAnswer(token, selectedOption, timeTaken) {
    const session = this.activeSessions.get(token);
    if (!session) throw new Error('Session not found');
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      throw new Error('Session expired');
    }
    if (session.currentCorrectIndex === null) throw new Error('No question loaded');

    const isCorrect = (selectedOption === session.currentCorrectIndex);
    const topic = session.plan[session.currentIndex].topic;

    session.answers.push({
      topic,
      isCorrect,
      timeTaken,
      selectedOption,
    });

    session.currentIndex++;
    session.currentCorrectIndex = null; // cleared for next question

    const questionsLeft = session.plan.length - session.currentIndex;
    const isComplete = questionsLeft <= 0;

    return { topic, isCorrect, selectedOption, timeTaken, questionsLeft, isComplete };
  }

  /* ---------------------------------------------------------------
     Complete session, calculate results, then delete from memory.
  --------------------------------------------------------------- */
  completeSession(token) {
    const session = this.activeSessions.get(token);
    if (!session) throw new Error('Session not found');

    const answers = session.answers;
    const total = answers.length;
    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const totalScore = total > 0 ? (totalCorrect / total) * 100 : 0;

    const topicCounts = {};
    answers.forEach((a) => {
      if (!topicCounts[a.topic]) topicCounts[a.topic] = { correct: 0, total: 0 };
      topicCounts[a.topic].total++;
      if (a.isCorrect) topicCounts[a.topic].correct++;
    });

    const perTopicScores = {};
    for (const [topic, counts] of Object.entries(topicCounts)) {
      perTopicScores[topic] = (counts.correct / counts.total) * 100;
    }

    const avgTimePerQuestion = total > 0 ? answers.reduce((s, a) => s + a.timeTaken, 0) / total : 0;

    // Delete session from memory (questions are gone)
    this.activeSessions.delete(token);

    return {
      totalScore,
      perTopicScores,
      avgTimePerQuestion,
      totalCorrect,
      totalQuestions: total,
    };
  }

  /* ---------------------------------------------------------------
     Private: shuffle options and track new correct index
  --------------------------------------------------------------- */
  _shuffleOptions(options, correctIndex, seed) {
    // Use a simple random shuffle (non‑seeded for real randomness)
    const arr = options.map((text, i) => ({ text, originalIndex: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const shuffledOptions = arr.map(item => item.text);
    const newCorrectIndex = arr.findIndex(item => item.originalIndex === correctIndex);
    return { shuffledOptions, newCorrectIndex };
  }

  /* ---------------------------------------------------------------
     Private: OpenAI generation (same as before)
  --------------------------------------------------------------- */
  async _generateWithOpenAI(topic, token) {
    const prompt = `Generate a Java DSA MCQ question about ${topic}. Respond in JSON: {"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","timeLimit":30}`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a Java DSA question generator.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 300,
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    let content = response.data.choices[0].message.content;
    content = content.replace(/```json|```/g, '').trim();
    return JSON.parse(content);
  }
}

module.exports = new DiagnosticGenerator();
