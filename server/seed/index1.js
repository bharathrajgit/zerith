// server/seed/index.js
// DSA Learning Platform – Complete Seed File
// Based on Kunal Kushwaha's Java + DSA Bootcamp playlist
// Run: node server/seed/index.js [--fresh]

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const MCQ = require('../models/MCQ');
const CodingProblem = require('../models/CodingProblem');
const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const Assessment = require('../models/Assessment');
const PerformanceLog = require('../models/PerformanceLog');
const User = require('../models/User');
const { normalizeSeedValue } = require('./textSanitizer');

// -----------------------------------------------------------------------
//  CONSOLE HELPERS
// -----------------------------------------------------------------------
const log = (msg) => console.log(`  ✓  ${msg}`);
const section = (title) => console.log(`\n${'═'.repeat(64)}\n  ${title}\n${'═'.repeat(64)}`);

// ============================================================================
//  MODULES (14)
// ============================================================================
const modules = [
    { order: 1, title: 'Fundamentals', description: 'Core programming concepts, Java basics, OOP and complexity analysis.', courseLevel: 'Beginner' },
    { order: 2, title: 'Patterns', description: 'Nested loop pattern problems to strengthen iteration skills.', courseLevel: 'Beginner' },
    { order: 3, title: 'Arrays', description: '1D/2D arrays, ArrayList, and classic array algorithms.', courseLevel: 'Beginner' },
    { order: 4, title: 'Strings', description: 'String manipulation, immutability, builders, and pattern matching.', courseLevel: 'Beginner' },
    { order: 5, title: 'Searching', description: 'Linear, binary, ternary and advanced search techniques.', courseLevel: 'Beginner' },
    { order: 6, title: 'Sorting', description: 'Comparison and non-comparison based sorting algorithms.', courseLevel: 'Intermediate' },
    { order: 7, title: 'Recursion', description: 'Recursive thinking, backtracking, and classic recursive problems.', courseLevel: 'Intermediate' },
    { order: 8, title: 'Linked Lists', description: 'Singly, doubly, circular linked lists and cycle detection.', courseLevel: 'Intermediate' },
    { order: 9, title: 'Stack & Queue', description: 'Stack, queue, circular queue, deque and priority queue.', courseLevel: 'Intermediate' },
    { order: 10, title: 'Trees', description: 'Binary trees, BST, tree traversals and views.', courseLevel: 'Advanced' },
    { order: 11, title: 'Heaps & Hashing', description: 'Heap data structure, HashMap/HashSet internals, and hashing algorithms.', courseLevel: 'Advanced' },
    { order: 12, title: 'Graphs', description: 'Graph representation, BFS, DFS, and shortest path algorithms.', courseLevel: 'Advanced' },
    { order: 13, title: 'DP', description: 'Dynamic programming fundamentals, knapsack, string and grid DP.', courseLevel: 'Advanced' },
    { order: 14, title: 'Advanced DSA', description: 'Tries, greedy algorithms, segment trees, and Mo\'s algorithm.', courseLevel: 'Advanced' },
];

const moduleLevelByOrder = Object.fromEntries(
    modules.map((module) => [module.order, module.courseLevel || 'Beginner'])
);

// ============================================================================
//  TOPICS (47)
//  videoUrl = YouTube ID ONLY – all verified from official SYLLABUS.md
// ============================================================================
const topics = [
    // -------------------- Module 1: Fundamentals (7 topics) --------------------
    {
        moduleOrder: 1, order: 1,
        title: 'Flowcharts & Pseudocode',
        videoUrl: 'lhELGQAV4gg',
        videoTitle: 'Flow of Program – Flowcharts & Pseudocode | Kunal Kushwaha',
        videoDuration: '25',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['flowchart', 'pseudocode', 'algorithm design', 'if condition', 'loops'],
    },
    {
        moduleOrder: 1, order: 2,
        title: 'Java Architecture & Setup',
        videoUrl: '4EP8YzcN0hQ',
        videoTitle: 'Introduction to Java – Architecture & Installation | Kunal Kushwaha',
        videoDuration: '35',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['JVM', 'JDK', 'JRE', 'bytecode', 'classpath', 'platform independence'],
    },
    {
        moduleOrder: 1, order: 3,
        title: 'First Java Program & Datatypes',
        videoUrl: 'TAtrPoaJ7gc',
        videoTitle: 'First Java Program – Input/Output, Debugging and Datatypes | Kunal Kushwaha',
        videoDuration: '55',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['primitive types', 'variables', 'type casting', 'Scanner', 'System.out'],
    },
    {
        moduleOrder: 1, order: 4,
        title: 'Conditionals & Loops',
        videoUrl: 'ldYLYRNaucM',
        videoTitle: 'Conditionals and Loops in Java | Kunal Kushwaha',
        videoDuration: '60',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['if-else', 'switch', 'for', 'while', 'do-while', 'break', 'continue'],
    },
    {
        moduleOrder: 1, order: 5,
        title: 'Functions & Methods',
        videoUrl: 'vvanI8NRlSI',
        videoTitle: 'Functions / Methods in Java | Kunal Kushwaha',
        videoDuration: '55',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['methods', 'return type', 'parameters', 'overloading', 'scope', 'varargs'],
    },
    {
        moduleOrder: 1, order: 6,
        title: 'OOP',
        videoUrl: 'BSVKUk58K6U',
        videoTitle: 'Object Oriented Programming in Java | Kunal Kushwaha',
        videoDuration: '75',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ['class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'this'],
    },
    {
        moduleOrder: 1, order: 7,
        title: 'Time & Space Complexity',
        videoUrl: 'mV3wrLBbuuE',
        videoTitle: 'Space and Time Complexity Analysis | Kunal Kushwaha',
        videoDuration: '150',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ['Big-O', 'Big-Theta', 'Big-Omega', 'complexity analysis', 'recurrence relation'],
    },

    // -------------------- Module 2: Patterns (3 topics) --------------------
    {
        moduleOrder: 2, order: 1,
        title: 'Star Patterns',
        videoUrl: 'xzstcj3Cuso',
        videoTitle: 'Pattern Questions – Star Patterns | Kunal Kushwaha',
        videoDuration: '40',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['nested loops', 'pattern printing', 'iteration', 'triangle', 'pyramid'],
    },
    {
        moduleOrder: 2, order: 2,
        title: 'Number & Character Patterns',
        videoUrl: 'AAAVJB9Bz1Q',
        videoTitle: 'Number and Character Patterns | Kunal Kushwaha',
        videoDuration: '30',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['nested loops', 'ASCII', 'char arithmetic', 'number triangle'],
    },
    {
        moduleOrder: 2, order: 3,
        title: 'Advanced Pattern Problems',
        videoUrl: 'y48leS-c06M',
        videoTitle: 'Advanced Pattern Problems | Kunal Kushwaha',
        videoDuration: '45',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ['diamond pattern', 'butterfly pattern', 'hollow patterns', 'spaces', 'nested loops'],
    },

    // -------------------- Module 3: Arrays (3 topics) --------------------
    {
        moduleOrder: 3, order: 1,
        title: '1D Arrays & ArrayList',
        videoUrl: 'n60Dn0UsbEk',
        videoTitle: 'Introduction to Arrays and ArrayList in Java | Kunal Kushwaha',
        videoDuration: '90',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['array', 'ArrayList', 'dynamic array', 'indexing', 'traversal', 'memory management'],
    },
    {
        moduleOrder: 3, order: 2,
        title: '2D Arrays & Matrix',
        videoUrl: 'enI_KyGLYPo',
        videoTitle: 'Binary Search in 2D Arrays / Matrix | Kunal Kushwaha',
        videoDuration: '55',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ['2D array', 'matrix', 'row-major', 'binary search on matrix', 'staircase search'],
    },
    {
        moduleOrder: 3, order: 3,
        title: 'Array Algorithms (Kadane, Two-Pointer)',
        videoUrl: 'sTdiMLom00U',
        videoTitle: 'Recursion – Array Problems | Kunal Kushwaha',
        videoDuration: '60',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ["Kadane's algorithm", 'two-pointer', 'sliding window', 'prefix sum', 'subarray'],
    },

    // -------------------- Module 4: Strings (3 topics) --------------------
    {
        moduleOrder: 4, order: 1,
        title: 'String Basics & Immutability',
        videoUrl: 'zL1DPZ0Ovlo',
        videoTitle: 'Strings in Java | Kunal Kushwaha',
        videoDuration: '80',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['String', 'immutability', 'String pool', 'charAt', 'substring', 'compareTo'],
    },
    {
        moduleOrder: 4, order: 2,
        title: 'StringBuilder & StringBuffer',
        videoUrl: 'YFZai3fPUQI',
        videoTitle: 'StringBuffer in Java | Kunal Kushwaha',
        videoDuration: '35',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['StringBuilder', 'StringBuffer', 'mutable string', 'append', 'reverse', 'thread-safe'],
    },
    {
        moduleOrder: 4, order: 3,
        title: 'String Pattern Matching',
        videoUrl: 'gdifkIwCJyg',
        videoTitle: 'Recursion – String Problems | Kunal Kushwaha',
        videoDuration: '60',
        difficultyLevel: 'Hard', courseLevel: 'Beginner',
        javaConceptTags: ['KMP algorithm', 'anagram', 'pattern matching', 'palindrome', 'subsequence'],
    },

    // -------------------- Module 5: Searching (3 topics) --------------------
    {
        moduleOrder: 5, order: 1,
        title: 'Linear Search',
        videoUrl: '_HRA37X8N_Q',
        videoTitle: 'Linear Search Algorithm – Theory + Code + Questions | Kunal Kushwaha',
        videoDuration: '28',
        difficultyLevel: 'Basic', courseLevel: 'Beginner',
        javaConceptTags: ['linear search', 'sequential search', 'O(n)', 'sentinel search'],
    },
    {
        moduleOrder: 5, order: 2,
        title: 'Binary Search',
        videoUrl: 'f6UU7V3szVw',
        videoTitle: 'Binary Search Algorithm – Theory + Code | Kunal Kushwaha',
        videoDuration: '58',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ['binary search', 'divide and conquer', 'sorted array', 'O(log n)', 'order-agnostic'],
    },
    {
        moduleOrder: 5, order: 3,
        title: 'Binary Search Interview Questions',
        videoUrl: 'W9QJ8HaRvJQ',
        videoTitle: 'Binary Search Interview Questions – Google, Facebook, Amazon | Kunal Kushwaha',
        videoDuration: '70',
        difficultyLevel: 'Medium', courseLevel: 'Beginner',
        javaConceptTags: ['first/last occurrence', 'peak element', 'rotated array', 'search answer space'],
    },

    // -------------------- Module 6: Sorting (3 topics) --------------------
    {
        moduleOrder: 6, order: 1,
        title: 'Basic Sorting (Bubble, Selection, Insertion)',
        videoUrl: 'F5MZyqRp_IM',
        videoTitle: 'Bubble Sort Algorithm – Theory + Code | Kunal Kushwaha',
        videoDuration: '30',
        difficultyLevel: 'Basic', courseLevel: 'Intermediate',
        javaConceptTags: ['bubble sort', 'selection sort', 'insertion sort', 'O(n²)', 'stable sort'],
    },
    {
        moduleOrder: 6, order: 2,
        title: 'Advanced Sorting (Merge, Quick)',
        videoUrl: 'iKGAgWdgoRk',
        videoTitle: 'Merge Sort Algorithm | Kunal Kushwaha',
        videoDuration: '65',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['merge sort', 'quick sort', 'divide and conquer', 'partition', 'O(n log n)'],
    },
    {
        moduleOrder: 6, order: 3,
        title: 'Specialised Sorting (Counting, Radix, Cyclic)',
        videoUrl: 'Z8svOqamag8',
        videoTitle: 'Quick Sort + Advanced Sorting | Kunal Kushwaha',
        videoDuration: '45',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['counting sort', 'radix sort', 'cyclic sort', 'non-comparison sort', 'O(n)'],
    },

    // -------------------- Module 7: Recursion (3 topics) --------------------
    {
        moduleOrder: 7, order: 1,
        title: 'Recursion Fundamentals',
        videoUrl: 'M2uO2nMT0Bk',
        videoTitle: 'Introduction to Recursion | Kunal Kushwaha',
        videoDuration: '90',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['recursion', 'base case', 'call stack', 'factorial', 'fibonacci', 'tail recursion'],
    },
    {
        moduleOrder: 7, order: 2,
        title: 'Recursive Problem Solving',
        videoUrl: 'JxILxTwHukM',
        videoTitle: 'Recursion – Subset, Permutation, Dice Throw | Kunal Kushwaha',
        videoDuration: '70',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['subsets', 'permutations', 'dice throw', 'recursion tree', 'power set'],
    },
    {
        moduleOrder: 7, order: 3,
        title: 'Backtracking (N-Queens, Sudoku)',
        videoUrl: 'nC1rbW2YSz0',
        videoTitle: 'Backtracking – N-Queens, N-Knights, Sudoku Solver | Kunal Kushwaha',
        videoDuration: '75',
        difficultyLevel: 'Hard', courseLevel: 'Intermediate',
        javaConceptTags: ['backtracking', 'N-Queens', 'Sudoku', 'pruning', 'state space', 'constraint satisfaction'],
    },

    // -------------------- Module 8: Linked Lists (3 topics) --------------------
    {
        moduleOrder: 8, order: 1,
        title: 'Singly Linked List',
        videoUrl: '58YbpRDc4yw',
        videoTitle: 'Linked List – Singly, Doubly, Circular | Kunal Kushwaha',
        videoDuration: '120',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['singly linked list', 'node', 'head', 'tail', 'insertion', 'deletion', 'traversal'],
    },
    {
        moduleOrder: 8, order: 2,
        title: 'Doubly Linked List & Reversal',
        videoUrl: '70tx7KcMROc',
        videoTitle: 'Linked List – Fast Slow Pointer, Cycle Detection, Reversal | Kunal Kushwaha',
        videoDuration: '90',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['doubly linked list', 'prev pointer', 'fast-slow pointer', 'reversal', 'recursion on LL'],
    },
    {
        moduleOrder: 8, order: 3,
        title: 'Circular Linked List & Cycle Detection',
        videoUrl: 'zg5v2rlV1tM',
        videoTitle: 'Backtracking – Maze Problems | Kunal Kushwaha',
        videoDuration: '60',
        difficultyLevel: 'Hard', courseLevel: 'Intermediate',
        javaConceptTags: ["circular linked list", "Floyd's algorithm", 'cycle detection', 'slow-fast pointers', 'entry point'],
    },

    // -------------------- Module 9: Stack & Queue (3 topics) --------------------
    {
        moduleOrder: 9, order: 1,
        title: 'Stack Implementation',
        videoUrl: 'rHQI4mrJ3cg',
        videoTitle: 'Stacks & Queues in Java | Kunal Kushwaha',
        videoDuration: '85',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['stack', 'LIFO', 'push', 'pop', 'peek', 'balanced parentheses', 'push-efficient'],
    },
    {
        moduleOrder: 9, order: 2,
        title: 'Queue & Circular Queue',
        videoUrl: 'S9LUYztYLu4',
        videoTitle: 'Stack & Queue Interview Problems | Kunal Kushwaha',
        videoDuration: '80',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['queue', 'FIFO', 'enqueue', 'dequeue', 'circular queue', 'queue using stack'],
    },
    {
        moduleOrder: 9, order: 3,
        title: 'Deque & PriorityQueue',
        videoUrl: 'Qf-TDPr0nYw',
        videoTitle: 'Deque & PriorityQueue in Java | Telusko (Java supplement)',
        videoDuration: '40',
        difficultyLevel: 'Medium', courseLevel: 'Intermediate',
        javaConceptTags: ['deque', 'ArrayDeque', 'PriorityQueue', 'min-heap', 'max-heap', 'Comparator'],
    },

    // -------------------- Module 10: Trees (3 topics) --------------------
    {
        moduleOrder: 10, order: 1,
        title: 'Binary Tree Fundamentals',
        videoUrl: '4s1Tcvm00pA',
        videoTitle: 'Trees – Introduction | Kunal Kushwaha',
        videoDuration: '85',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['binary tree', 'node', 'root', 'leaf', 'height', 'depth', 'level order', 'BFS', 'DFS'],
    },
    {
        moduleOrder: 10, order: 2,
        title: 'Binary Search Tree',
        videoUrl: '9D-vP-jcc-Y',
        videoTitle: 'BST – Interview Questions | Kunal Kushwaha',
        videoDuration: '75',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['BST', 'insertion', 'deletion', 'search', 'inorder', 'successor', 'validate BST'],
    },
    {
        moduleOrder: 10, order: 3,
        title: 'Tree Traversals & Views',
        videoUrl: 'Qdr3ohMSxBo',
        videoTitle: 'Tree Traversals – DFS, BFS, Views | Coding Ninjas Java supplement',
        videoDuration: '70',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['inorder', 'preorder', 'postorder', 'level-order', 'left view', 'right view', 'top view', 'bottom view'],
    },

    // -------------------- Module 11: Heaps & Hashing (3 topics) --------------------
    {
        moduleOrder: 11, order: 1,
        title: 'Heap Data Structure',
        videoUrl: 'CVA85JuJEn0',
        videoTitle: 'Heaps – Introduction & Heap Sort | Kunal Kushwaha',
        videoDuration: '80',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['heap', 'min-heap', 'max-heap', 'heapify', 'heap sort', 'priority queue', 'k-way merge'],
    },
    {
        moduleOrder: 11, order: 2,
        title: 'HashMap & HashSet Internals',
        videoUrl: 'XLbvmMz8Fr8',
        videoTitle: 'HashMap Internals – Hashing in Java | Kunal Kushwaha',
        videoDuration: '75',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['HashMap', 'HashSet', 'hashing', 'collision', 'chaining', 'load factor', 'open addressing'],
    },
    {
        moduleOrder: 11, order: 3,
        title: 'Advanced Hashing (Rabin-Karp)',
        videoUrl: 'swciWFPq3NE',
        videoTitle: 'Rabin-Karp / Karp-Rabin Algorithm | Kunal Kushwaha',
        videoDuration: '55',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['Rabin-Karp', 'rolling hash', 'polynomial hash', 'string hashing', 'pattern search'],
    },

    // -------------------- Module 12: Graphs (3 topics) --------------------
    {
        moduleOrder: 12, order: 1,
        title: 'Graph Representation',
        videoUrl: 'gDGw0cvFXPQ',
        videoTitle: 'Graph Representation – Adjacency List & Matrix | Java supplement',
        videoDuration: '40',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['adjacency matrix', 'adjacency list', 'directed graph', 'undirected graph', 'weighted graph', 'edge list'],
    },
    {
        moduleOrder: 12, order: 2,
        title: 'BFS & DFS',
        videoUrl: '9RHO6jU--Ss',
        videoTitle: 'BFS and DFS in Graphs – Java | Kunal Kushwaha supplement',
        videoDuration: '65',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['BFS', 'DFS', 'visited array', 'queue', 'stack', 'connected components', 'topological sort'],
    },
    {
        moduleOrder: 12, order: 3,
        title: "Shortest Path (Dijkstra's)",
        videoUrl: '2odLxQWYDi0',
        videoTitle: "Dijkstra's Shortest Path Algorithm | Java supplement",
        videoDuration: '55',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ["Dijkstra", 'shortest path', 'priority queue', 'relaxation', 'weighted graph', 'greedy'],
    },

    // -------------------- Module 13: DP (3 topics) --------------------
    {
        moduleOrder: 13, order: 1,
        title: 'DP Fundamentals',
        videoUrl: 'mV3wrLBbuuE',
        videoTitle: 'Space and Time Complexity + DP Introduction | Kunal Kushwaha',
        videoDuration: '150',
        difficultyLevel: 'Medium', courseLevel: 'Advanced',
        javaConceptTags: ['memoization', 'tabulation', 'overlapping subproblems', 'optimal substructure', 'fibonacci DP'],
    },
    {
        moduleOrder: 13, order: 2,
        title: 'Knapsack & Subset DP',
        videoUrl: '4eFBBVGNzLo',
        videoTitle: '0/1 Knapsack – Dynamic Programming | Java supplement',
        videoDuration: '60',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['0/1 knapsack', 'subset sum', 'unbounded knapsack', 'partition equal subset', 'target sum'],
    },
    {
        moduleOrder: 13, order: 3,
        title: 'DP on Strings & Grid',
        videoUrl: 'guzgnCSafg4',
        videoTitle: 'DP on Strings – LCS, Edit Distance, Grid DP | Java supplement',
        videoDuration: '65',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['LCS', 'edit distance', 'grid DP', 'coin change', 'longest palindromic subsequence'],
    },

    // -------------------- Module 14: Advanced DSA (4 topics) --------------------
    {
        moduleOrder: 14, order: 1,
        title: 'Tries (Prefix Trees)',
        videoUrl: 'AXjmTQ8LEoI',
        videoTitle: 'Trie Data Structure | Kunal Kushwaha',
        videoDuration: '60',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['trie', 'prefix tree', 'insert', 'search', 'startsWith', 'autocomplete'],
    },
    {
        moduleOrder: 14, order: 2,
        title: 'Greedy Algorithms',
        videoUrl: 'ARvQcqJ_-NY',
        videoTitle: 'Greedy Algorithms | Kunal Kushwaha',
        videoDuration: '55',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['greedy', 'activity selection', 'interval scheduling', 'Huffman coding', 'fractional knapsack'],
    },
    {
        moduleOrder: 14, order: 3,
        title: 'Segment Trees',
        videoUrl: 'ciHThtTVNto',
        videoTitle: 'Segment Tree Data Structure | Kunal Kushwaha',
        videoDuration: '75',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ['segment tree', 'range query', 'point update', 'build', 'lazy propagation'],
    },
    {
        moduleOrder: 14, order: 4,
        title: "Mo's Algorithm",
        videoUrl: 'Mp5Dk95G8Ik',
        videoTitle: "Mo's Algorithm – Offline Range Queries | Java supplement",
        videoDuration: '50',
        difficultyLevel: 'Hard', courseLevel: 'Advanced',
        javaConceptTags: ["Mo's algorithm", 'offline queries', 'block decomposition', 'sqrt decomposition', 'range queries'],
    },
];

const supplementalLearningAssets = {
    '5_3': [
        {
            type: 'video',
            source: 'curated-supplement',
            videoId: 'f6UU7V3szVw',
            title: 'Binary Search Building Blocks in Java',
            durationMinutes: 58,
            language: 'English',
            tech: 'Java',
            isCodingRelevant: true,
        },
    ],
    '6_2': [
        {
            type: 'video',
            source: 'curated-supplement',
            videoId: 'Z8svOqamag8',
            title: 'Quick Sort and Advanced Sorting Follow-up',
            durationMinutes: 45,
            language: 'English',
            tech: 'Java',
            isCodingRelevant: true,
        },
    ],
    '7_2': [
        {
            type: 'video',
            source: 'curated-supplement',
            videoId: 'nC1rbW2YSz0',
            title: 'Backtracking Continuation for Recursion Patterns',
            durationMinutes: 75,
            language: 'English',
            tech: 'Java',
            isCodingRelevant: true,
        },
    ],
    '10_3': [
        {
            type: 'video',
            source: 'curated-supplement',
            videoId: '4s1Tcvm00pA',
            title: 'Binary Tree Fundamentals Refresher',
            durationMinutes: 85,
            language: 'English',
            tech: 'Java',
            isCodingRelevant: true,
        },
    ],
    '13_1': [
        {
            type: 'video',
            source: 'curated-supplement',
            videoId: '4eFBBVGNzLo',
            title: 'Knapsack as DP Transition Practice',
            durationMinutes: 60,
            language: 'English',
            tech: 'Java',
            isCodingRelevant: true,
        },
    ],
};

const buildLearningAssets = (topic, isCodingRelevant) => {
    if (Array.isArray(topic.learningAssets) && topic.learningAssets.length > 0) {
        return topic.learningAssets;
    }

    const primaryDuration = Number(topic.videoDuration) || 0;
    const primary = {
        type: 'video',
        source: 'primary-curated',
        videoId: topic.videoUrl,
        title: topic.videoTitle || topic.title,
        durationMinutes: primaryDuration,
        language: 'English',
        tech: 'Java',
        isCodingRelevant,
    };

    const key = `${topic.moduleOrder}_${topic.order}`;
    return [
        primary,
        ...(supplementalLearningAssets[key] || []),
    ];
};

// ============================================================================
//  MCQs (10 per topic = 470 total)
//  Distribution per topic: 4 Basic, 4 Medium, 2 Hard
// ============================================================================
const mcqs = [

    // -------------------- MODULE 1 – FUNDAMENTALS --------------------

    // Topic 1.1 – Flowcharts & Pseudocode
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['flowchart', 'symbols'],
        question: 'Which symbol is used to represent a decision in a flowchart?',
        options: ['Rectangle', 'Oval', 'Diamond', 'Parallelogram'], correctAnswer: 2,
        explanation: "In Kunal's video, a diamond shape represents a decision (yes/no branch) in a flowchart."
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['flowchart', 'start-stop'],
        question: 'Which shape represents the Start/Stop in a flowchart?',
        options: ['Rectangle', 'Diamond', 'Oval/Rounded rectangle', 'Parallelogram'], correctAnswer: 2,
        explanation: 'Ovals or rounded rectangles are used for start and stop terminals in standard flowcharts as taught in the video.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['pseudocode'],
        question: 'What is pseudocode?',
        options: ['Compiled Java code', 'An informal high-level description of an algorithm', 'Machine code', 'Binary representation'], correctAnswer: 1,
        explanation: 'Kunal explains pseudocode as an informal, human-readable description of algorithm steps, not tied to any syntax.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['flowchart', 'arrow'],
        question: 'Arrows in a flowchart represent:',
        options: ['Data values', 'The flow of control / execution order', 'Loop counters', 'Variable declarations'], correctAnswer: 1,
        explanation: 'Arrows (flow lines) show the direction of program flow between steps as shown in Kunal\'s flowchart examples.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['pseudocode', 'loop'],
        question: 'In pseudocode, which construct best represents "repeat until condition is true"?',
        options: ['IF-THEN-ELSE', 'FOR loop', 'WHILE loop', 'DO-WHILE loop'], correctAnswer: 3,
        explanation: 'A DO-WHILE loop checks the condition after executing the body, matching "repeat until" semantics.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['flowchart', 'primes'],
        question: "In the prime-number flowchart from Kunal's video, what is the role of the divisor loop?",
        options: ['Print all numbers', 'Check divisibility from 2 to √n', 'Add all factors', 'Count even numbers'], correctAnswer: 1,
        explanation: 'The video\'s prime flowchart iterates divisors from 2 up to √n to check divisibility.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['algorithm', 'flowchart'],
        question: 'Which flowchart element stores and retrieves data?',
        options: ['Decision diamond', 'Parallelogram (I/O)', 'Rectangle (process)', 'Arrow'], correctAnswer: 1,
        explanation: 'Parallelograms represent input and output operations (reading/writing data) in a flowchart.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['pseudocode', 'structure'],
        question: 'Why is pseudocode preferred over actual code for initial algorithm design?',
        options: ['It runs faster', 'It is language-independent and readable', 'It is compiled', 'It uses less memory'], correctAnswer: 1,
        explanation: 'Pseudocode abstracts syntax details, letting us focus on logic – a key point from Kunal\'s introduction.'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['flowchart', 'complexity'],
        question: 'A flowchart has a decision diamond with two branches, each containing a loop of n steps. What is the overall time complexity?',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'], correctAnswer: 1,
        explanation: 'Only one branch of a decision executes; each branch has O(n) steps, so overall complexity is O(n).'
    },
    {
        moduleOrder: 1, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['pseudocode', 'correctness'],
        question: 'Which is NOT a benefit of writing pseudocode before coding?',
        options: ['Easier to detect logical errors early', 'Language-independent design', 'Faster compilation', 'Clearer communication with teammates'], correctAnswer: 2,
        explanation: 'Pseudocode is not compiled at all; its benefit is clarity and language independence, not execution speed.'
    },

    // Topic 1.2 – Java Architecture & Setup
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['JVM', 'bytecode'],
        question: 'What does JVM stand for?',
        options: ['Java Variable Manager', 'Java Virtual Machine', 'Java Verified Module', 'Just Valid Memory'], correctAnswer: 1,
        explanation: 'Kunal explains that JVM (Java Virtual Machine) executes Java bytecode on any platform.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['JDK', 'JRE'],
        question: 'Which component includes the compiler (javac)?',
        options: ['JRE', 'JVM', 'JDK', 'Bytecode'], correctAnswer: 2,
        explanation: 'JDK (Java Development Kit) contains the compiler javac, as shown in Kunal\'s setup walkthrough.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['bytecode', 'platform'],
        question: 'Java achieves platform independence through:',
        options: ['Native compilation', 'Bytecode and JVM', 'Direct OS calls', 'C++ interop'], correctAnswer: 1,
        explanation: 'Java source → bytecode → JVM interprets it on any OS, making it platform-independent per Kunal\'s explanation.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['JRE'],
        question: 'JRE contains:',
        options: ['Compiler + JVM', 'JVM + libraries', 'Only the compiler', 'Only class files'], correctAnswer: 1,
        explanation: 'JRE (Java Runtime Environment) contains the JVM and standard libraries needed to run Java programs.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['classpath', 'compilation'],
        question: 'What command compiles a Java source file?',
        options: ['java Hello.java', 'javac Hello.java', 'run Hello.java', 'compile Hello.java'], correctAnswer: 1,
        explanation: '`javac` is the Java compiler that converts .java source to .class bytecode files.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['JVM', 'execution'],
        question: 'What command runs a compiled Java class named Hello?',
        options: ['javac Hello', 'java Hello.class', 'java Hello', 'run Hello'], correctAnswer: 2,
        explanation: '`java Hello` (without .class extension) launches the JVM and executes the Hello class.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['JVM', 'garbage-collection'],
        question: 'Which JVM component is responsible for automatic memory management?',
        options: ['ClassLoader', 'JIT Compiler', 'Garbage Collector', 'Execution Engine'], correctAnswer: 2,
        explanation: 'The Garbage Collector automatically reclaims unused heap memory, a key Java feature.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['JIT', 'performance'],
        question: 'JIT compilation in JVM means:',
        options: ['Compiling Java to C++', 'Converting bytecode to native code at runtime for speed', 'Slow interpretation of bytecode', 'Ahead-of-time compilation'], correctAnswer: 1,
        explanation: 'JIT (Just-In-Time) compiler converts frequently used bytecode to native machine code at runtime for better performance.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['classloader', 'JVM'],
        question: 'Which ClassLoader loads the core Java API classes?',
        options: ['Application ClassLoader', 'Extension ClassLoader', 'Bootstrap ClassLoader', 'Custom ClassLoader'], correctAnswer: 2,
        explanation: 'Bootstrap ClassLoader loads rt.jar (core API), and is the parent of all other class loaders in the JVM hierarchy.'
    },
    {
        moduleOrder: 1, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['JVM', 'memory-areas'],
        question: 'Where are local variables stored in Java memory?',
        options: ['Heap', 'Method Area', 'Stack', 'PC Register'], correctAnswer: 2,
        explanation: 'Each thread has its own Stack that stores local variables and method call frames; the Heap stores objects.'
    },

    // Topic 1.3 – First Java Program & Datatypes
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['main method'],
        question: 'What is the correct signature of the main method in Java?',
        options: ['public static void main()', 'public void main(String args)', 'public static void main(String[] args)', 'static main(String[] args)'], correctAnswer: 2,
        explanation: 'Kunal shows `public static void main(String[] args)` as the entry point in the first Java program demo.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['datatypes', 'int'],
        question: 'What is the size of an `int` in Java?',
        options: ['2 bytes', '4 bytes', '8 bytes', '1 byte'], correctAnswer: 1,
        explanation: 'In Java, `int` is always 32 bits (4 bytes) regardless of the platform, as explained in Kunal\'s datatypes video.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['datatypes', 'char'],
        question: 'What is the size of a `char` in Java?',
        options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], correctAnswer: 1,
        explanation: 'Java `char` is 16-bit (2 bytes) and uses Unicode, unlike C/C++ where char is 1 byte.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['Scanner', 'input'],
        question: 'Which class is used to read user input in Java?',
        options: ['System.in', 'BufferedReader', 'Scanner', 'InputReader'], correctAnswer: 2,
        explanation: '`Scanner sc = new Scanner(System.in)` is the standard way to read input as shown in Kunal\'s video.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['type-casting'],
        question: 'What is the output of: int x = (int) 9.9; System.out.println(x);',
        options: ['10', '9', '9.9', 'Error'], correctAnswer: 1,
        explanation: 'Explicit casting from double to int truncates the decimal part; 9.9 becomes 9.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['datatypes', 'long'],
        question: 'Which suffix is required for a long literal in Java?',
        options: ['d', 'f', 'L', 'l is not required'], correctAnswer: 2,
        explanation: 'Long literals require the `L` suffix (e.g., `long x = 123456789L`) to avoid compiler errors.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['overflow'],
        question: 'What happens if you store 2147483648 in an int variable?',
        options: ['Compile error', 'Runtime exception', 'Overflow – wraps to negative', 'Truncation'], correctAnswer: 2,
        explanation: 'Integer overflow causes wraparound. 2147483647 + 1 wraps to -2147483648 (MIN_VALUE).'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['boolean', 'datatypes'],
        question: 'In Java, boolean can hold values:',
        options: ['0 or 1', 'true or false', 'yes or no', 'Any integer'], correctAnswer: 1,
        explanation: 'Java boolean holds only `true` or `false`; there is no integer equivalence as in C/C++.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['implicit-casting'],
        question: 'Which assignment causes an implicit narrowing warning/error?',
        options: ['double d = 5;', 'float f = 5.0f;', 'byte b = 130;', 'long l = 5;'], correctAnswer: 2,
        explanation: '130 exceeds byte\'s range (−128 to 127), causing a compile-time narrowing conversion error.'
    },
    {
        moduleOrder: 1, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['unicode', 'char'],
        question: 'What does `char c = 65;` print?',
        options: ['65', 'A', 'error', 'a'], correctAnswer: 1,
        explanation: 'char 65 corresponds to ASCII/Unicode \'A\'. Printing a char shows the character, not the number.'
    },

    // Topic 1.4 – Conditionals & Loops
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Basic', questionType: 'conceptual', tags: ['if-else'],
        question: 'Which statement correctly uses if-else in Java?',
        options: ['if x > 0 {}', 'if(x > 0) {} else {}', 'if(x > 0) then {} else {}', 'if [x > 0] {}'], correctAnswer: 1,
        explanation: 'Java requires parentheses around conditions: `if(condition) { } else { }` as shown in Kunal\'s video.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Basic', questionType: 'conceptual', tags: ['for-loop'],
        question: 'How many times does `for(int i=0;i<5;i++)` execute?',
        options: ['4', '5', '6', 'Infinite'], correctAnswer: 1,
        explanation: 'The loop starts at 0, increments, and stops when i reaches 5 – so it executes exactly 5 times (0,1,2,3,4).'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Basic', questionType: 'conceptual', tags: ['while-loop'],
        question: 'A while loop checks the condition:',
        options: ['After execution', 'Before execution', 'During execution', 'Never'], correctAnswer: 1,
        explanation: 'In a while loop, the condition is evaluated before each iteration begins.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Basic', questionType: 'conceptual', tags: ['break'],
        question: 'What does the `break` statement do in a loop?',
        options: ['Skips the current iteration', 'Exits the loop immediately', 'Restarts the loop', 'Throws an exception'], correctAnswer: 1,
        explanation: '`break` immediately exits the enclosing loop or switch, as demonstrated in Kunal\'s loops section.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Medium', questionType: 'application', tags: ['do-while'],
        question: 'What is the minimum number of times a do-while loop body executes?',
        options: ['0', '1', '2', 'Depends on condition'], correctAnswer: 1,
        explanation: 'A do-while loop always executes the body at least once, then checks the condition.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Medium', questionType: 'application', tags: ['nested-loops'],
        question: 'What is the total number of iterations for nested loops: outer 3, inner 4?',
        options: ['7', '12', '34', '81'], correctAnswer: 1,
        explanation: 'Total iterations = outer × inner = 3 × 4 = 12.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Medium', questionType: 'application', tags: ['switch'],
        question: 'In a switch statement, what happens if there is no `break` after a case?',
        options: ['Compile error', 'Only that case runs', 'Fall-through to next case', 'Loop restarts'], correctAnswer: 2,
        explanation: 'Without a break, switch falls through to the next case – Kunal demonstrates this with a calculator program.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Medium', questionType: 'reasoning', tags: ['continue'],
        question: 'What does `continue` do in a for loop?',
        options: ['Exits the loop', 'Skips rest of current iteration and goes to next', 'Breaks the outer loop', 'Resets i to 0'], correctAnswer: 1,
        explanation: '`continue` skips the remaining statements in the current iteration and moves to the next iteration check.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Hard', questionType: 'reasoning', tags: ['nested-loops', 'break'],
        question: 'In nested loops, `break` exits:',
        options: ['The innermost loop only', 'All loops', 'The outermost loop', 'The program'], correctAnswer: 0,
        explanation: '`break` only exits the immediately enclosing loop. To break multiple loops, use labels.'
    },
    {
        moduleOrder: 1, topicOrder: 4, difficulty: 'Hard', questionType: 'reasoning', tags: ['infinite-loop'],
        question: 'Which of the following creates an infinite loop?',
        options: ['for(int i=0;i<10;i++)', 'while(true)', 'for(;;)', 'Both B and C'], correctAnswer: 3,
        explanation: 'Both `while(true)` and `for(;;)` create infinite loops – common Java patterns.'
    },

    // Topic 1.5 – Functions & Methods
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Basic', questionType: 'conceptual', tags: ['method', 'signature'],
        question: 'Which is a valid Java method signature?',
        options: ['void greet string name', 'public void greet(String name)', 'greet(String name) void', 'def greet(name)'], correctAnswer: 1,
        explanation: 'Java methods require access modifier, return type, method name, and typed parameters in parentheses.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Basic', questionType: 'conceptual', tags: ['return'],
        question: 'A method with return type `void`:',
        options: ['Must return 0', 'Cannot have a return statement', 'May have an empty return statement', 'Must return null'], correctAnswer: 2,
        explanation: 'A void method can have `return;` (no value) to exit early, but cannot return a value.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Basic', questionType: 'conceptual', tags: ['overloading'],
        question: 'Method overloading means:',
        options: ['Same name, different parameters', 'Same name, same parameters', 'Different class, same method', 'Overriding parent method'], correctAnswer: 0,
        explanation: 'Overloading allows multiple methods with the same name but different parameter lists, as shown by Kunal.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Basic', questionType: 'conceptual', tags: ['scope'],
        question: 'Variables declared inside a method are:',
        options: ['Global', 'Local to the method', 'Static', 'Accessible from all classes'], correctAnswer: 1,
        explanation: 'Local variables are scoped to the method block and are not accessible outside it.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Medium', questionType: 'application', tags: ['varargs'],
        question: 'What does `void print(int... nums)` allow?',
        options: ['Exactly 1 int', 'Only 2 ints', 'Zero or more ints', 'Only arrays'], correctAnswer: 2,
        explanation: 'Varargs (`int... nums`) allows passing zero or more int arguments; treated as array inside the method.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Medium', questionType: 'application', tags: ['recursion', 'stack'],
        question: 'Each method call in Java creates a new:',
        options: ['Heap object', 'Stack frame', 'Static field', 'Thread'], correctAnswer: 1,
        explanation: 'Each method call pushes a new stack frame onto the call stack; popped when the method returns.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Medium', questionType: 'reasoning', tags: ['pass-by-value'],
        question: 'In Java, primitive arguments are passed:',
        options: ['By reference', 'By pointer', 'By value', 'By name'], correctAnswer: 2,
        explanation: 'Java always passes primitives by value – changes inside the method don\'t affect the original variable.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Medium', questionType: 'reasoning', tags: ['shadowing'],
        question: 'Variable shadowing occurs when:',
        options: ['A local variable has the same name as a field', 'Two methods have the same name', 'A class has no constructor', 'An interface is not implemented'], correctAnswer: 0,
        explanation: 'Shadowing is when a local variable name hides an instance/class variable – covered in Kunal\'s scoping section.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Hard', questionType: 'reasoning', tags: ['overloading', 'resolution'],
        question: 'When two overloaded methods both match, Java selects the:',
        options: ['First declared', 'Most specific match', 'Random one', 'Causes compile error'], correctAnswer: 1,
        explanation: 'Java resolves overloading by choosing the most specific applicable method.'
    },
    {
        moduleOrder: 1, topicOrder: 5, difficulty: 'Hard', questionType: 'reasoning', tags: ['call-stack', 'overflow'],
        question: 'What causes a StackOverflowError?',
        options: ['Too many heap objects', 'Infinite recursion without a base case', 'Out of memory', 'Integer overflow'], correctAnswer: 1,
        explanation: 'Infinite recursion (missing base case) keeps pushing frames onto the call stack until it overflows.'
    },

    // Topic 1.6 – OOP
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Basic', questionType: 'conceptual', tags: ['class', 'object'],
        question: 'A class in Java is best described as:',
        options: ['A running instance', 'A blueprint for objects', 'A method collection', 'A primitive type'], correctAnswer: 1,
        explanation: 'Kunal describes a class as a blueprint/template from which objects (instances) are created.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Basic', questionType: 'conceptual', tags: ['inheritance'],
        question: 'Keyword used for inheritance in Java:',
        options: ['implements', 'inherits', 'extends', 'super'], correctAnswer: 2,
        explanation: '`extends` is used for class inheritance in Java: `class Dog extends Animal`.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Basic', questionType: 'conceptual', tags: ['encapsulation'],
        question: 'Encapsulation is achieved by:',
        options: ['Making fields public', 'Making fields private with getters/setters', 'Using abstract classes', 'Using interfaces'], correctAnswer: 1,
        explanation: 'Encapsulation hides internal state using private fields and exposes them through public getters/setters.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Basic', questionType: 'conceptual', tags: ['this-keyword'],
        question: '`this` keyword in Java refers to:',
        options: ['The parent class', 'The current object', 'A static method', 'The class itself'], correctAnswer: 1,
        explanation: '`this` references the current object instance, often used to differentiate instance fields from parameters.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Medium', questionType: 'application', tags: ['polymorphism'],
        question: 'Runtime polymorphism in Java is achieved via:',
        options: ['Method overloading', 'Static binding', 'Method overriding', 'Final methods'], correctAnswer: 2,
        explanation: 'Method overriding with a parent reference pointing to a child object achieves runtime polymorphism.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Medium', questionType: 'application', tags: ['abstraction', 'interface'],
        question: 'An interface in Java can contain (Java 8+):',
        options: ['Only abstract methods', 'Only concrete methods', 'Abstract, default, and static methods', 'Constructors'], correctAnswer: 2,
        explanation: 'Java 8+ interfaces allow abstract methods, default methods, and static methods.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Medium', questionType: 'reasoning', tags: ['constructor'],
        question: 'If no constructor is defined, Java provides:',
        options: ['No constructor', 'A default no-arg constructor', 'A parameterized constructor', 'A copy constructor'], correctAnswer: 1,
        explanation: 'Java automatically provides a default no-argument constructor if none is explicitly defined.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Medium', questionType: 'reasoning', tags: ['super', 'constructor'],
        question: '`super()` call must be:',
        options: ['Last statement in constructor', 'First statement in constructor', 'Inside main method', 'After this()'], correctAnswer: 1,
        explanation: '`super()` must be the first statement in a constructor to properly initialise the parent class.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Hard', questionType: 'reasoning', tags: ['abstract-class'],
        question: 'An abstract class CANNOT be:',
        options: ['Extended', 'Instantiated', 'Have concrete methods', 'Have constructors'], correctAnswer: 1,
        explanation: 'Abstract classes cannot be instantiated directly; they must be extended by a concrete subclass.'
    },
    {
        moduleOrder: 1, topicOrder: 6, difficulty: 'Hard', questionType: 'reasoning', tags: ['multiple-inheritance'],
        question: 'Java does not support multiple class inheritance because:',
        options: ['It is too slow', 'Diamond problem ambiguity', 'JVM limitation', 'Memory constraints'], correctAnswer: 1,
        explanation: 'The diamond problem (ambiguous method resolution) is why Java disallows multiple class inheritance, using interfaces instead.'
    },

    // Topic 1.7 – Time & Space Complexity
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Basic', questionType: 'conceptual', tags: ['Big-O', 'O(1)'],
        question: 'O(1) time complexity means:',
        options: ['Linear time', 'Constant time', 'Logarithmic time', 'Quadratic time'], correctAnswer: 1,
        explanation: 'O(1) means the operation takes constant time regardless of input size – explained by Kunal at the start of the complexity video.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Basic', questionType: 'conceptual', tags: ['Big-O', 'O(n)'],
        question: 'Which algorithm has O(n) time complexity?',
        options: ['Binary Search', 'Linear Search', 'Bubble Sort', 'Matrix Multiplication'], correctAnswer: 1,
        explanation: 'Linear Search visits each element once, giving O(n) time complexity.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Basic', questionType: 'conceptual', tags: ['Big-O', 'O(log n)'],
        question: 'Binary Search has time complexity:',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], correctAnswer: 2,
        explanation: 'Binary Search halves the search space each step → O(log n), a key example in Kunal\'s video.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Basic', questionType: 'conceptual', tags: ['space-complexity'],
        question: 'Space complexity measures:',
        options: ['CPU cycles used', 'Memory used by an algorithm', 'Disk space', 'Network bandwidth'], correctAnswer: 1,
        explanation: 'Space complexity quantifies the amount of memory an algorithm uses relative to input size.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Medium', questionType: 'application', tags: ['nested-loops', 'O(n²)'],
        question: 'Two nested loops each running n times give complexity:',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2n)'], correctAnswer: 2,
        explanation: 'Each outer iteration triggers n inner iterations → total n² operations → O(n²).'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Medium', questionType: 'application', tags: ['Big-Omega'],
        question: 'Big-Omega (Ω) notation represents:',
        options: ['Upper bound', 'Exact bound', 'Lower bound', 'Average case'], correctAnswer: 2,
        explanation: 'Ω gives the lower bound (best case) on an algorithm\'s growth rate.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Medium', questionType: 'reasoning', tags: ['Big-Theta'],
        question: 'Big-Theta (Θ) notation means:',
        options: ['Only upper bound', 'Only lower bound', 'Both upper and lower bound (tight bound)', 'Worst case only'], correctAnswer: 2,
        explanation: 'Θ gives a tight bound – the algorithm grows at exactly that rate, not faster or slower asymptotically.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Medium', questionType: 'reasoning', tags: ['drop-constants'],
        question: 'Why do we drop constants in Big-O? e.g., O(2n) → O(n)?',
        options: ['Constants are always zero', 'For large n, constants become negligible', 'It is a Java convention', 'JVM optimises constants'], correctAnswer: 1,
        explanation: 'Big-O describes growth rate for large inputs; constant factors don\'t affect the growth rate trend.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Hard', questionType: 'reasoning', tags: ['recurrence'],
        question: 'T(n) = T(n/2) + O(1) solves to:',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'This recurrence (binary search pattern) solves to O(log n) by the master theorem / substitution method.'
    },
    {
        moduleOrder: 1, topicOrder: 7, difficulty: 'Hard', questionType: 'reasoning', tags: ['merge-sort-complexity'],
        question: 'T(n) = 2T(n/2) + O(n) solves to:',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 1,
        explanation: 'This is the merge sort recurrence; by Master Theorem case 2, it solves to O(n log n).'
    },

    // -------------------- MODULE 2 – PATTERNS --------------------

    // Topic 2.1 – Star Patterns
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['nested-loops', 'pattern'],
        question: 'To print a right-angle triangle of stars with n rows, how many loops are needed?',
        options: ['One', 'Two', 'Three', 'Four'], correctAnswer: 1,
        explanation: 'A right-angle triangle uses an outer loop for rows and an inner loop for columns (stars per row).'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['inner-loop', 'stars'],
        question: 'For row `i` (1-indexed) in a right-angle triangle, how many stars are printed?',
        options: ['n-i', 'i', 'n', 'i*i'], correctAnswer: 1,
        explanation: 'Row i has exactly i stars. This is the fundamental pattern: row 1 → 1 star, row 2 → 2 stars, etc.'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['System.out'],
        question: 'To print without newline in Java, use:',
        options: ['System.out.println()', 'System.out.print()', 'System.out.printf()', 'Both B and C'], correctAnswer: 3,
        explanation: 'Both `print()` and `printf()` don\'t add a newline; `println()` adds a newline after output.'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['pyramid', 'spaces'],
        question: 'A centred pyramid requires printing spaces before stars. For row i in an n-row pyramid, spaces = ?',
        options: ['i', 'n-i', 'i-1', 'n-i spaces'], correctAnswer: 3,
        explanation: 'Each row needs (n-i) leading spaces to centre the stars for a pyramid pattern.'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['inverted-triangle'],
        question: 'For an inverted right-angle triangle with n rows, the outer loop variable `i` goes from:',
        options: ['1 to n', 'n to 1', '0 to n', 'n to 0'], correctAnswer: 1,
        explanation: 'An inverted triangle prints n stars in row 1 down to 1 star in the last row, so i goes from n down to 1.'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['nested-loops', 'complexity'],
        question: 'Time complexity of printing an n-row star triangle is:',
        options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'Total stars printed = 1+2+...+n = n(n+1)/2 ≈ O(n²).'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['loop-structure'],
        question: 'Which loop is the best choice for printing a fixed-count pattern?',
        options: ['while', 'do-while', 'for', 'recursion'], correctAnswer: 2,
        explanation: 'A `for` loop is idiomatic when the count is known ahead of time, as Kunal uses for patterns.'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['pattern', 'diamond'],
        question: 'A diamond pattern of stars requires:',
        options: ['1 loop', '2 loops', '3 loops in series (top half + bottom half)', '4 nested loops'], correctAnswer: 2,
        explanation: 'A diamond is typically printed as two triangles (top increasing, bottom decreasing) using 2 loop blocks.'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['hollow-triangle'],
        question: 'In a hollow triangle, stars are only printed at:',
        options: ['Every cell', 'First and last column, and last row', 'Middle cells', 'Corners only'], correctAnswer: 1,
        explanation: 'A hollow triangle prints stars at the leftmost column, rightmost column, and the last row (border only).'
    },
    {
        moduleOrder: 2, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['optimization'],
        question: 'Which approach reduces the number of print calls for star patterns?',
        options: ['Calling System.out.println once per row using StringBuilder', 'Using System.out.print for each star', 'Using recursion', 'Using arrays'], correctAnswer: 0,
        explanation: 'Building each row in a StringBuilder and printing once per row minimises I/O calls and is more efficient.'
    },

    // Topic 2.2 – Number & Character Patterns
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['char-arithmetic', 'ASCII'],
        question: 'The ASCII value of \'A\' is:',
        options: ['65', '97', '48', '64'], correctAnswer: 0,
        explanation: '\'A\' has ASCII/Unicode value 65. In Java, `(int)\'A\'` returns 65.'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['char', 'int-cast'],
        question: 'If `char c = \'A\'`, what does `c + 2` return in Java?',
        options: ['\'C\'', '67 (int)', '\'A\'2', 'Error'], correctAnswer: 1,
        explanation: 'Arithmetic on char in Java returns int. \'A\'(65) + 2 = 67. To get \'C\', cast: (char)(c + 2).'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['number-pattern'],
        question: 'In a number pattern where row i prints numbers 1 to i, row 3 prints:',
        options: ['1 2', '1 2 3', '3 3 3', '3 2 1'], correctAnswer: 1,
        explanation: 'Row i prints numbers 1 through i: row 3 prints 1 2 3.'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['char-pattern', 'alphabet'],
        question: 'To print the alphabet pattern where row 1 has \'A\', row 2 has \'A\' \'B\', use:',
        options: ['char c = i', 'char c = (char)(\'A\' + j)', 'char c = j', 'char c = \'A\' * i'], correctAnswer: 1,
        explanation: '`(char)(\'A\' + j)` gives the j-th letter after \'A\', producing A, B, C, etc.'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['continuous-number'],
        question: 'In a continuous number pattern (1,2,3,4,5... across rows), a counter variable `num` should be:',
        options: ['Reset to 1 each row', 'Initialised once outside both loops', 'Set to row number', 'Decremented'], correctAnswer: 1,
        explanation: 'A counter initialised before both loops and incremented in the inner loop produces consecutive numbers across the pattern.'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['palindrome-row'],
        question: 'Floyd\'s triangle row i contains numbers from:',
        options: ['1 to i', 'i² to (i+1)²', 'A sequence of i consecutive integers continuing from previous row', 'Powers of 2'], correctAnswer: 2,
        explanation: 'Floyd\'s triangle fills consecutive integers row by row; each row continues from where the last left off.'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['char-reverse'],
        question: 'To print characters in reverse (Z, Y, X...) in a pattern:',
        options: ['char c = \'A\' + j', 'char c = (char)(\'Z\' - j)', 'char c = \'A\' - j', 'char c = j + 65'], correctAnswer: 1,
        explanation: '`(char)(\'Z\' - j)` subtracts j from \'Z\'(90) to get Z, Y, X, etc.'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['Pascal-triangle'],
        question: 'Pascal\'s triangle is best generated using:',
        options: ['2D array storing nCr values', 'Single counter', 'Char arithmetic', 'Recursion only'], correctAnswer: 0,
        explanation: 'Pascal\'s triangle is built using a 2D array where triangle[i][j] = triangle[i-1][j-1] + triangle[i-1][j].'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['number-pattern', 'complexity'],
        question: 'Printing an n-row number pattern (row i has i numbers) has space complexity:',
        options: ['O(n²)', 'O(n)', 'O(1)', 'O(n log n)'], correctAnswer: 2,
        explanation: 'If printed directly without storing, space complexity is O(1) (only loop variables needed).'
    },
    {
        moduleOrder: 2, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['mixed-pattern'],
        question: 'In a mirrored number pattern (1 2 3 2 1 per row), the inner loop logic uses:',
        options: ['One loop 1 to 2i-1', 'Two loops: 1 to i and i-1 to 1', 'Single decreasing loop', 'No inner loop'], correctAnswer: 1,
        explanation: 'Print ascending 1 to i, then descending i-1 to 1, effectively mirroring the row.'
    },

    // Topic 2.3 – Advanced Pattern Problems
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['butterfly', 'pattern'],
        question: 'A butterfly pattern is formed by:',
        options: ['One triangle', 'Two mirrored triangles side by side', 'A diamond', 'A rectangle'], correctAnswer: 1,
        explanation: 'Butterfly pattern has two right-angle triangles mirrored horizontally with spaces between them.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['hollow-square'],
        question: 'In a hollow n×n square, stars appear at:',
        options: ['All cells', 'Only corners', 'First row, last row, first col, last col', 'Diagonal only'], correctAnswer: 2,
        explanation: 'A hollow square prints stars only on the border: first/last row and first/last column.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['spiral-pattern'],
        question: 'Generating a number spiral in a 2D array requires:',
        options: ['One loop', 'A 2D array with directional traversal', 'Recursion only', 'LinkedList'], correctAnswer: 1,
        explanation: 'Spirals require a 2D array and direction control (right, down, left, up) to fill numbers spirally.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['spaces-pattern'],
        question: 'In an advanced pyramid, the number of spaces on each side of row i (n rows total) is:',
        options: ['i', 'i-1', 'n-i', 'n'], correctAnswer: 2,
        explanation: '(n-i) leading spaces are needed for row i to centre the pattern in an n-row pyramid.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['diamond', 'two-loops'],
        question: 'A diamond with n rows in the widest part has total rows:',
        options: ['n', '2n-1', '2n', 'n+1'], correctAnswer: 1,
        explanation: 'A diamond has n rows expanding and then n-1 rows contracting = 2n-1 rows total.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['hollow-diamond'],
        question: 'A hollow diamond prints stars only on:',
        options: ['All positions', 'Border of the diamond shape', 'Odd rows', 'Even columns'], correctAnswer: 1,
        explanation: 'Only the boundary of the diamond (edges) has stars; interior is spaces.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['pattern-complexity'],
        question: 'Time complexity of printing a full n×n square pattern is:',
        options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'An n×n grid has n² cells to print, giving O(n²) time complexity.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['condition-per-cell'],
        question: 'To decide whether to print a star or space in an advanced pattern, we check:',
        options: ['Only row number', 'Only column number', 'A condition involving both row and column', 'Random value'], correctAnswer: 2,
        explanation: 'Patterns like hollow shapes and diagonals require conditions on both row (i) and column (j) simultaneously.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['zigzag-pattern'],
        question: 'A zigzag pattern in a 3-row arrangement uses which mathematical trick?',
        options: ['Modulo operation on column index', 'Multiplication of row and col', 'Power function', 'Array sort'], correctAnswer: 0,
        explanation: 'Zigzag patterns typically use `col % (2*(n-1))` to determine which row each character falls on.'
    },
    {
        moduleOrder: 2, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['StringBuilder', 'pattern-efficiency'],
        question: 'Why use StringBuilder in pattern printing instead of direct System.out.print?',
        options: ['StringBuilder is slower', 'Reduces I/O overhead by buffering each row', 'Required by Java spec', 'Supports char arithmetic'], correctAnswer: 1,
        explanation: 'System.out.print has overhead per call; building the row in StringBuilder and printing once is more efficient.'
    },

    // -------------------- MODULE 3 – ARRAYS --------------------

    // Topic 3.1 – 1D Arrays & ArrayList
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['array', 'declaration'],
        question: 'How do you declare an integer array of size 5 in Java?',
        options: ['int array = new int(5)', 'int[] array = new int[5]', 'array int[5]', 'int array[5]'], correctAnswer: 1,
        explanation: 'Java array declaration: `int[] array = new int[5]` allocates a contiguous block of 5 integers on the heap.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['array', 'indexing'],
        question: 'What is the index of the last element in an array of size n?',
        options: ['n', 'n-1', 'n+1', '0'], correctAnswer: 1,
        explanation: 'Arrays are 0-indexed in Java; the last valid index is n-1.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['ArrayList', 'dynamic'],
        question: 'ArrayList differs from a plain array because:',
        options: ['ArrayList is faster', 'ArrayList can grow dynamically', 'ArrayList stores only Strings', 'ArrayList is primitive'], correctAnswer: 1,
        explanation: 'ArrayList automatically resizes (doubles capacity) when full, unlike fixed-size arrays – shown in Kunal\'s video.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['array', 'memory'],
        question: 'Java arrays are stored in:',
        options: ['Stack', 'Heap', 'Method Area', 'PC Register'], correctAnswer: 1,
        explanation: 'Array objects are allocated on the heap; the reference variable is on the stack.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['array', 'exception'],
        question: 'Accessing an index beyond array bounds throws:',
        options: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IllegalArgumentException', 'ClassCastException'], correctAnswer: 1,
        explanation: 'Java throws ArrayIndexOutOfBoundsException at runtime when an invalid index is accessed.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['ArrayList', 'autoboxing'],
        question: 'ArrayList<Integer> stores:',
        options: ['Primitive int', 'Integer objects', 'Both', 'char values'], correctAnswer: 1,
        explanation: 'ArrayList can only hold objects; Java autoboxes `int` to `Integer` when adding to ArrayList<Integer>.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['array', 'pass-by-reference'],
        question: 'When an array is passed to a method, modifications inside affect the original because:',
        options: ['Arrays are primitive', 'Arrays are passed by reference (object reference is copied)', 'Java has no scope', 'Static variables are used'], correctAnswer: 1,
        explanation: 'Arrays are objects; the reference is passed by value, but modifying array contents affects the original object.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['ArrayList', 'amortized'],
        question: 'ArrayList add() is O(1) amortized because:',
        options: ['It never resizes', 'When it resizes, it doubles capacity reducing resize frequency', 'It uses a linked list internally', 'Resizing is O(1)'], correctAnswer: 1,
        explanation: 'Doubling capacity on resize means resizing happens rarely, making the amortized cost of add() O(1).'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['multi-dim', 'memory'],
        question: 'A 2D array int[3][4] in Java stores how many ints?',
        options: ['7', '12', '34', '24'], correctAnswer: 1,
        explanation: '3 rows × 4 columns = 12 integers total.'
    },
    {
        moduleOrder: 3, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['arrays', 'clone'],
        question: '`int[] b = a;` creates:',
        options: ['A deep copy', 'A shallow copy (both reference same array)', 'A new sorted array', 'A null reference'], correctAnswer: 1,
        explanation: 'This copies the reference, not the array contents; both a and b point to the same heap array.'
    },

    // Topic 3.2 – 2D Arrays & Matrix
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['2D-array', 'matrix'],
        question: 'How do you access element at row 2, column 3 of a 2D array `m`?',
        options: ['m[3][2]', 'm[2][3]', 'm(2,3)', 'm.get(2,3)'], correctAnswer: 1,
        explanation: '2D array access: `m[row][col]` → `m[2][3]` for row 2, column 3 (0-indexed).'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['matrix', 'traverse'],
        question: 'To traverse all elements of a 2D m×n matrix, you need:',
        options: ['1 loop', '2 nested loops', '3 loops', 'Recursion'], correctAnswer: 1,
        explanation: 'Two nested loops iterate over rows (m) and columns (n) to visit each element.'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['transpose'],
        question: 'Transpose of a matrix swaps:',
        options: ['Rows and rows', 'Columns and columns', 'Rows and columns', 'Diagonal elements'], correctAnswer: 2,
        explanation: 'Transposing a matrix means mat[i][j] becomes mat[j][i] – rows and columns are exchanged.'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['binary-search-2D'],
        question: 'Binary search on a row-sorted 2D matrix treats it as a:',
        options: ['Heap', '1D flattened array', 'Stack', 'Graph'], correctAnswer: 1,
        explanation: 'Row-sorted 2D matrices can be binary-searched by converting 1D index to [mid/cols][mid%cols].'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['staircase-search'],
        question: 'Staircase search on a sorted matrix starts from:',
        options: ['Top-left', 'Bottom-left', 'Top-right', 'Bottom-right'], correctAnswer: 2,
        explanation: 'Start top-right: if target < current, move left; if target > current, move down. O(m+n) time.'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['matrix-rotation'],
        question: 'To rotate a matrix 90° clockwise in-place, the steps are:',
        options: ['Transpose then reverse each row', 'Reverse rows then transpose', 'Sort each row', 'Reverse columns'], correctAnswer: 0,
        explanation: '90° clockwise rotation = Transpose + Reverse each row. This is a classic in-place matrix trick.'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['spiral-order'],
        question: 'Spiral order traversal of an m×n matrix has time complexity:',
        options: ['O(m+n)', 'O(m×n)', 'O(m²)', 'O(log(m×n))'], correctAnswer: 1,
        explanation: 'Every element is visited exactly once, giving O(m×n) time complexity.'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['jagged-array'],
        question: 'In Java, a jagged (ragged) array is:',
        options: ['A 2D array with unequal row lengths', 'An invalid array', 'A sorted 2D array', 'Same as ArrayList'], correctAnswer: 0,
        explanation: 'Java supports jagged arrays where each row can have a different number of columns.'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['matrix-search-complexity'],
        question: 'Binary search on an m×n sorted matrix has time complexity:',
        options: ['O(m+n)', 'O(log(m×n))', 'O(m×n)', 'O(m log n)'], correctAnswer: 1,
        explanation: 'Treating the matrix as a 1D array of size m×n and binary-searching gives O(log(m×n)).'
    },
    {
        moduleOrder: 3, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['set-zeroes'],
        question: 'Set Matrix Zeroes (if element is 0, set row and column to 0) optimal space complexity is:',
        options: ['O(m×n)', 'O(m+n)', 'O(1)', 'O(log(m×n))'], correctAnswer: 2,
        explanation: 'Using the first row and column as markers gives O(1) extra space (classic trick).'
    },

    // Topic 3.3 – Array Algorithms (Kadane, Two-Pointer)
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ["Kadane's", 'max-subarray'],
        question: "Kadane's algorithm solves the:",
        options: ['Sorting problem', 'Maximum subarray sum problem', 'Matrix rotation', 'Two sum problem'], correctAnswer: 1,
        explanation: "Kadane's algorithm finds the contiguous subarray with the largest sum in O(n) time."
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['two-pointer'],
        question: 'The two-pointer technique requires the array to be:',
        options: ['Randomly shuffled', 'Sorted (in most cases)', 'Reversed', 'Binary'], correctAnswer: 1,
        explanation: 'Most two-pointer problems (pair sum, three sum) require a sorted array to work correctly.'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['sliding-window'],
        question: 'Sliding window is most useful for:',
        options: ['Finding an element', 'Contiguous subarray/substring problems', 'Sorting', 'Graph traversal'], correctAnswer: 1,
        explanation: 'Sliding window efficiently handles problems about fixed or variable length contiguous subarrays.'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['prefix-sum'],
        question: 'Prefix sum array allows range sum queries in:',
        options: ['O(n) per query', 'O(1) per query after O(n) build', 'O(log n) per query', 'O(n²) per query'], correctAnswer: 1,
        explanation: 'After O(n) build of prefix sum array, any range sum [l,r] = prefix[r] - prefix[l-1] in O(1).'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ["Kadane's", 'reset'],
        question: "In Kadane's algorithm, the current subarray sum is reset to 0 when:",
        options: ['It exceeds max', 'It becomes negative', 'Array ends', 'A duplicate is found'], correctAnswer: 1,
        explanation: "If currentSum < 0, starting a new subarray gives a better sum, so reset to 0 (or start fresh)."
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['two-pointer', 'pair-sum'],
        question: 'For pair sum = target in a sorted array, two-pointer moves:',
        options: ['Both left', 'Both right', 'Left right if sum > target; right left if sum < target', 'Random direction'], correctAnswer: 2,
        explanation: 'If sum > target, move right pointer left; if sum < target, move left pointer right; stop when equal.'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['sliding-window', 'max-sum-k'],
        question: 'Max sum subarray of size k using sliding window has complexity:',
        options: ['O(n²)', 'O(n)', 'O(k)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Sliding window adds one element and removes one per step, giving O(n) instead of O(n×k) brute force.'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['prefix-sum', '2D'],
        question: '2D prefix sum array enables submatrix sum queries in:',
        options: ['O(m×n)', 'O(1)', 'O(m+n)', 'O(m×n²)'], correctAnswer: 1,
        explanation: '2D prefix sum allows O(1) submatrix sum queries after O(m×n) build time.'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ["Kadane's", 'circular'],
        question: 'Maximum circular subarray sum can be found using Kadane\'s + the trick of:',
        options: ['Sorting the array', 'totalSum - minimum subarray sum', 'Reversing the array', 'Binary search'], correctAnswer: 1,
        explanation: 'Circular max = max(Kadane on array, totalSum - min subarray sum) to handle wrap-around.'
    },
    {
        moduleOrder: 3, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['three-pointer', 'three-sum'],
        question: 'Three-sum problem complexity with sorting + two-pointer:',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'], correctAnswer: 2,
        explanation: 'Fix one element O(n), run two-pointer O(n) for each → O(n²) total. Much better than brute O(n³).'
    },

    // -------------------- MODULE 4 – STRINGS --------------------

    // Topic 4.1 – String Basics & Immutability
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['String', 'immutable'],
        question: 'Why is String immutable in Java?',
        options: ['JVM limitation', 'Security, caching, and thread-safety benefits', 'Faster I/O', 'Compiler restriction'], correctAnswer: 1,
        explanation: 'Kunal explains String immutability enables string pool caching, security (e.g. passwords), and thread safety.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['String', 'pool'],
        question: 'String pool is located in:',
        options: ['Stack', 'Heap (PermGen / Metaspace)', 'Method Area', 'PC Register'], correctAnswer: 1,
        explanation: 'The String pool resides in the heap (was in PermGen pre-Java 8, now in heap/Metaspace).'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['equals', '=='],
        question: '`==` vs `.equals()` for Strings in Java:',
        options: ['Both compare content', '== compares content, equals compares reference', '== compares reference, equals compares content', 'Both compare references'], correctAnswer: 2,
        explanation: '`==` checks reference equality; `.equals()` checks character-by-character content equality.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['charAt'],
        question: '`"Hello".charAt(1)` returns:', options: ['H', 'e', 'l', 'error'], correctAnswer: 1,
        explanation: 'charAt(1) returns the character at index 1 (0-indexed): \'e\'.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['substring'],
        question: '`"HelloWorld".substring(5)` returns:',
        options: ['Hello', 'World', 'HelloWorld', 'ello'], correctAnswer: 1,
        explanation: 'substring(5) returns from index 5 to end: "World".'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['toCharArray'],
        question: 'What does `str.toCharArray()` return?', options: ['String[]', 'char[]', 'int[]', 'List<Character>'], correctAnswer: 1,
        explanation: 'toCharArray() converts the String to a char[] array for character-level manipulation.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['concatenation', 'performance'],
        question: 'Why is repeated String concatenation in a loop slow?',
        options: ['Strings are stored in stack', 'Each + creates a new String object due to immutability', 'Strings are encrypted', 'Java limits concatenation'], correctAnswer: 1,
        explanation: 'Each `+` on Strings creates a new object; n concatenations → O(n²) total work due to copying.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['intern'],
        question: '`String.intern()` does:', options: ['Converts to int', 'Adds to string pool and returns pooled reference', 'Reverses the string', 'Encrypts the string'], correctAnswer: 1,
        explanation: '`intern()` puts the string in the pool (or returns the existing pooled reference), enabling `==` comparison.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['String', 'hashcode'],
        question: 'Java String `hashCode()` is computed based on:', options: ['Memory address', 'All character values using a polynomial formula', 'String length only', 'Random value'], correctAnswer: 1,
        explanation: 'Java String hashCode = s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1], a polynomial of character values.'
    },
    {
        moduleOrder: 4, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['split', 'regex'],
        question: '`"a.b.c".split("\\\\.")` produces:', options: ['["a.b.c"]', '["a","b","c"]', '["a","b.c"]', 'Error'], correctAnswer: 1,
        explanation: 'split() takes a regex; "\\\\." escapes the dot to match a literal period, splitting into ["a","b","c"].'
    },

    // Topic 4.2 – StringBuilder & StringBuffer
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['StringBuilder', 'mutable'],
        question: 'StringBuilder is mutable because:',
        options: ['It uses a char[]', 'It is a primitive', 'It uses String pool', 'JVM treats it specially'], correctAnswer: 0,
        explanation: 'StringBuilder internally uses a resizable char array, allowing in-place modification without creating new objects.'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['StringBuffer', 'thread-safe'],
        question: 'StringBuffer vs StringBuilder: StringBuffer is:', options: ['Faster', 'Thread-safe (synchronized)', 'Immutable', 'Deprecated'], correctAnswer: 1,
        explanation: 'StringBuffer methods are synchronized, making it thread-safe but slower than StringBuilder.'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['StringBuilder', 'append'],
        question: '`sb.append("World")` on StringBuilder "Hello" results in:', options: ['"HelloWorld"', '"WorldHello"', '"Hello World"', 'Error'], correctAnswer: 0,
        explanation: 'append() adds to the end of the existing content: "Hello" + "World" = "HelloWorld".'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['StringBuilder', 'reverse'],
        question: '`new StringBuilder("abcde").reverse().toString()` returns:', options: ['"abcde"', '"edcba"', '"abced"', 'Error'], correctAnswer: 1,
        explanation: 'reverse() reverses the char sequence in-place, giving "edcba".'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['StringBuilder', 'insert'],
        question: '`sb.insert(2, "XY")` on "Hello" inserts "XY" at index:', options: ['End', 'Beginning', 'Position 2', 'Position 3'], correctAnswer: 2,
        explanation: 'insert(2, "XY") inserts "XY" starting at index 2: "He" + "XY" + "llo" = "HeXYllo".'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['StringBuilder', 'delete'],
        question: '`sb.delete(1,3)` on "Hello" removes characters at indices:', options: ['1 only', '1 and 2', '1,2,3', '0,1,2'], correctAnswer: 1,
        explanation: 'delete(start, end) removes chars from start (inclusive) to end (exclusive): indices 1 and 2.'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['StringBuilder', 'capacity'],
        question: 'Default initial capacity of StringBuilder is:', options: ['8', '16', '32', '64'], correctAnswer: 1,
        explanation: 'Default StringBuilder capacity is 16 characters; it doubles (+ 2) when exceeded.'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['immutable-vs-mutable'],
        question: 'For building a long string in a loop, which is best?', options: ['String concatenation with +', 'StringBuilder', 'StringBuffer', 'String.format()'], correctAnswer: 1,
        explanation: 'StringBuilder is O(n) for building a string; + operator is O(n²) due to repeated object creation.'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['StringBuilder', 'toString'],
        question: '`sb.toString()` creates:', options: ['A new mutable object', 'A new immutable String', 'Modifies sb', 'Returns char[]'], correctAnswer: 1,
        explanation: 'toString() creates a new immutable String object from the current StringBuilder content.'
    },
    {
        moduleOrder: 4, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['StringBuilder', 'time-complexity'],
        question: 'Time complexity of appending n characters one by one to StringBuilder:', options: ['O(n²)', 'O(n)', 'O(1)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Each append is O(1) amortized (doubling strategy); n appends = O(n) total.'
    },

    // Topic 4.3 – String Pattern Matching
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['anagram'],
        question: 'Two strings are anagrams if they:', options: ['Have same length', 'Contain same characters same number of times', 'Are equal', 'Have same prefix'], correctAnswer: 1,
        explanation: 'Anagrams use the exact same characters with the same frequency, possibly in different order.'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['palindrome'],
        question: 'A palindrome reads the same:', options: ['From left only', 'Forward and backward', 'When reversed partially', 'In any order'], correctAnswer: 1,
        explanation: '"racecar" reversed is "racecar" – reads the same forwards and backwards.'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['KMP', 'failure-function'],
        question: "KMP algorithm's key component is the:", options: ['Hash table', 'Failure function (LPS array)', 'Binary tree', 'Stack'], correctAnswer: 1,
        explanation: "KMP's failure function (Longest Proper Prefix which is also Suffix array) enables O(n+m) pattern matching."
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['brute-force', 'pattern'],
        question: 'Brute force string pattern matching has time complexity:', options: ['O(n)', 'O(n×m)', 'O(n+m)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'For text length n and pattern length m, brute force checks every position: O(n×m).'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['anagram', 'frequency-array'],
        question: 'Best way to check if two strings are anagrams in O(n):', options: ['Sort both and compare', 'Frequency count array of size 26', 'Two nested loops', 'Stack comparison'], correctAnswer: 1,
        explanation: 'Count char frequencies in a 26-size array; if all zero after processing both strings, they are anagrams. O(n) time.'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['KMP', 'complexity'],
        question: 'KMP pattern matching time complexity is:', options: ['O(n×m)', 'O(n+m)', 'O(n log n)', 'O(m²)'], correctAnswer: 1,
        explanation: 'KMP preprocesses the pattern in O(m) and searches in O(n), total O(n+m).'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['longest-palindrome', 'expand'],
        question: "Expand around center approach for longest palindromic substring has complexity:", options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(n³)'], correctAnswer: 1,
        explanation: 'Expanding from each of the 2n-1 centers costs O(n) per center in the worst case → O(n²).'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['subsequence'],
        question: "To check if string A is a subsequence of B:", options: ['Sort both then compare', 'Two-pointer on both strings', 'KMP always required', 'Hash both strings'], correctAnswer: 1,
        explanation: 'Use two pointers: advance pointer in B for each match in A; O(|B|) time.'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['KMP', 'LPS-build'],
        question: "In KMP's LPS array, LPS[i] represents:", options: ['Length of longest suffix ending at i', 'Length of longest proper prefix of substring [0..i] which is also a suffix', 'Number of matches', 'Pattern frequency'], correctAnswer: 1,
        explanation: 'LPS[i] = length of longest proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].'
    },
    {
        moduleOrder: 4, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['Manacher', 'palindrome'],
        question: "Manacher's algorithm finds all palindromic substrings in:", options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(n³)'], correctAnswer: 2,
        explanation: "Manacher's algorithm uses previously computed palindrome lengths to achieve O(n) for all palindromic substrings."
    },

    // -------------------- MODULE 5 – SEARCHING --------------------

    // Topic 5.1 – Linear Search
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linear-search'],
        question: 'Linear search works on:', options: ['Only sorted arrays', 'Both sorted and unsorted arrays', 'Only linked lists', 'Only integers'], correctAnswer: 1,
        explanation: 'Linear search visits elements sequentially; it works on any array regardless of sorting.'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linear-search', 'complexity'],
        question: 'Worst-case complexity of linear search on n elements:', options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'], correctAnswer: 1,
        explanation: 'In the worst case (element at end or not present), linear search checks all n elements: O(n).'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linear-search', 'best-case'],
        question: 'Best-case complexity of linear search:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctAnswer: 2,
        explanation: 'If the target is the first element, it is found in O(1) – best case.'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['linear-search', 'not-found'],
        question: 'If element not found in linear search, return:', options: ['0', '-1', 'n', 'null'], correctAnswer: 1,
        explanation: 'Convention: return -1 when element is not found in the array.'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['linear-search', 'all-occurrences'],
        question: 'To find ALL occurrences of a value using linear search:', options: ['Stop at first match', 'Continue and collect all matching indices', 'Sort first', 'Use binary search'], correctAnswer: 1,
        explanation: 'Continue scanning after finding a match, adding each matching index to a result list.'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['sentinel-search'],
        question: 'Sentinel linear search reduces:', options: ['Space usage', 'Number of comparisons per iteration (removes bounds check)', 'Time to O(log n)', 'Code length'], correctAnswer: 1,
        explanation: 'Placing target at end as sentinel removes the index bounds check, reducing comparisons per step.'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['linear-search', '2D'],
        question: 'Linear search on a 2D m×n array has complexity:', options: ['O(m+n)', 'O(m×n)', 'O(m)', 'O(n)'], correctAnswer: 1,
        explanation: 'Must visit all m×n elements in the worst case.'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['linear-search', 'string'],
        question: 'Linear search for a character in a String of length n:', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'Scanning each character of the string is O(n).'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['linear-search', 'average-case'],
        question: 'Average-case complexity of linear search (element present, uniform distribution):', options: ['O(1)', 'O(n/2) = O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'On average, the element is found after n/2 comparisons, which is still O(n).'
    },
    {
        moduleOrder: 5, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['ordered-linear-search'],
        question: 'For a sorted array, linear search can terminate early when:', options: ['Element > current', 'Element > target (skip rest)', 'Array is empty', 'i == n/2'], correctAnswer: 1,
        explanation: 'In a sorted array, once current element exceeds target, target cannot be further right; terminate early.'
    },

    // Topic 5.2 – Binary Search
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['binary-search', 'requirement'],
        question: 'Binary search requires the array to be:', options: ['Unsorted', 'Sorted', 'Of even length', 'Non-empty'], correctAnswer: 1,
        explanation: 'Binary search exploits sorted order by eliminating half the search space each step.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['binary-search', 'mid'],
        question: 'How is `mid` calculated to avoid integer overflow?', options: ['(low+high)/2', 'low + (high-low)/2', '(low*high)/2', 'high - low/2'], correctAnswer: 1,
        explanation: '`low + (high-low)/2` avoids the overflow that can occur with `(low+high)/2` for large indices.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['binary-search', 'step'],
        question: 'If arr[mid] > target in binary search, update:', options: ['low = mid+1', 'high = mid-1', 'mid = high', 'low = mid'], correctAnswer: 1,
        explanation: 'Target must be in the left half; move high pointer to mid-1 to search left.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['binary-search', 'complexity'],
        question: 'Time complexity of binary search:', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 2,
        explanation: 'Each step halves the search space; after log₂(n) steps, one element remains.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['order-agnostic'],
        question: 'Order-agnostic binary search first checks:', options: ['The middle element', 'Whether array is ascending or descending', 'The last element', 'Array length'], correctAnswer: 1,
        explanation: 'Compare first and last elements to determine sort order, then apply appropriate binary search direction.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['first-occurrence'],
        question: 'To find first occurrence using binary search, after finding target at mid:', options: ['Return immediately', 'Set high = mid-1 and remember mid', 'Set low = mid+1', 'Return mid+1'], correctAnswer: 1,
        explanation: 'Continue searching left (high = mid-1) while saving mid as a candidate to find the leftmost occurrence.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['binary-search', 'infinite'],
        question: 'Binary search can be applied to:', options: ['Only integer arrays', 'Any monotonic search space including answer space', 'Hash tables', 'Graphs'], correctAnswer: 1,
        explanation: 'Binary search applies to any monotonic function; "binary search on answer" is a powerful technique.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['recursive-binary', 'stack'],
        question: 'Recursive binary search space complexity vs iterative:', options: ['Both O(1)', 'Recursive O(log n) stack, Iterative O(1)', 'Both O(log n)', 'Iterative O(n)'], correctAnswer: 1,
        explanation: 'Recursive version uses O(log n) call stack frames; iterative uses O(1) extra space.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['sqrt', 'binary-search'],
        question: 'Finding integer square root of n using binary search has complexity:', options: ['O(n)', 'O(log n)', 'O(√n)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Binary search on [1, n] for floor(√n) makes O(log n) iterations.'
    },
    {
        moduleOrder: 5, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['rotated-sorted', 'binary-search'],
        question: 'Binary search on a rotated sorted array requires:', options: ['O(n)', 'Identifying sorted half at each step → O(log n)', 'Sorting first', 'Two passes'], correctAnswer: 1,
        explanation: 'Check which half is sorted; target must be in the sorted half or the other half. Still O(log n).'
    },

    // Topic 5.3 – Binary Search Interview Questions
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['peak-element'],
        question: 'A peak element is one that is:', options: ['Maximum in array', 'Greater than its neighbours', 'Minimum in array', 'At index 0'], correctAnswer: 1,
        explanation: 'A peak element is greater than or equal to its adjacent elements.'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['search-insert-position'],
        question: 'Search insert position (LeetCode 35) finds:', options: ['Element location only', 'Index where target is or should be inserted', 'Minimum element', 'Last element'], correctAnswer: 1,
        explanation: 'Returns the index of target if found, or the index where it should be inserted to maintain sorted order.'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['answer-space', 'binary-search'],
        question: '"Binary search on answer" is used when:', options: ['Array is unsorted', 'The answer is monotonically increasing/decreasing', 'Array has duplicates', 'Array is circular'], correctAnswer: 1,
        explanation: 'When we can define a monotonic feasibility function, binary search can find the optimal answer directly.'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['floor-ceil', 'binary-search'],
        question: 'Floor of x in a sorted array is:', options: ['Smallest element > x', 'Largest element ≤ x', 'Exact match of x', 'Middle element'], correctAnswer: 1,
        explanation: 'Floor(x) = largest element in array that is ≤ x. Ceiling(x) = smallest element ≥ x.'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['minimum-rotated'],
        question: 'Finding minimum in a rotated sorted array uses binary search in:', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'By checking which half is sorted, we can identify where rotation occurred and find min in O(log n).'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['kth-missing', 'binary-search'],
        question: 'Kth missing positive number can be solved with binary search on:', options: ['The array values', 'The answer space [1, arr[n-1]+k]', 'A hash set', 'Sorted pairs'], correctAnswer: 1,
        explanation: 'Binary search on answer: check how many numbers ≤ mid are missing; narrow to find kth missing in O(log n).'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['allocate-books', 'binary-search'],
        question: 'Allocate minimum pages (or painter\'s partition) uses binary search on:', options: ['Number of students', 'Answer space: max pages per student', 'Array of pages', 'Number of books'], correctAnswer: 1,
        explanation: 'Binary search on [max_page, total_pages]; for each mid, check feasibility in O(n) → O(n log n) total.'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['count-occurrences'],
        question: 'Count of occurrences of x in sorted array using binary search:', options: ['O(n)', 'lastOccurrence - firstOccurrence + 1 in O(log n)', 'O(1)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Two binary searches for first and last occurrence give count in O(log n).'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['median-sorted-arrays'],
        question: 'Median of two sorted arrays optimal complexity:', options: ['O(n+m)', 'O(log(min(m,n)))', 'O(n log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'Binary search on the smaller array to find the correct partition gives O(log(min(m,n))).'
    },
    {
        moduleOrder: 5, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['aggressive-cows', 'binary-search'],
        question: '"Aggressive Cows" problem uses binary search to:', options: ['Sort cows', 'Maximise minimum distance between cows', 'Count cows', 'Find median stall'], correctAnswer: 1,
        explanation: 'Binary search on the answer (minimum distance); for each candidate, greedily check placement feasibility.'
    },

    // -------------------- MODULE 6 – SORTING --------------------

    // Topic 6.1 – Basic Sorting
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['bubble-sort'],
        question: 'Bubble sort repeatedly:', options: ['Divides array in half', 'Swaps adjacent out-of-order elements', 'Inserts elements', 'Selects minimum'], correctAnswer: 1,
        explanation: 'Bubble sort compares and swaps adjacent elements, bubbling the largest to the end each pass.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['selection-sort'],
        question: 'Selection sort works by:', options: ['Comparing adjacent pairs', 'Finding minimum and placing at correct position', 'Merging sorted halves', 'Partitioning'], correctAnswer: 1,
        explanation: 'Selection sort finds the minimum of the unsorted portion and swaps it to the front each iteration.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['insertion-sort'],
        question: 'Insertion sort best-case complexity is:', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'], correctAnswer: 2,
        explanation: 'Insertion sort on an already-sorted array makes no swaps, only n-1 comparisons → O(n) best case.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['stable-sort'],
        question: 'Which O(n²) sort is stable?', options: ['Selection Sort', 'Bubble Sort and Insertion Sort', 'Bubble Sort only', 'None'], correctAnswer: 1,
        explanation: 'Both Bubble Sort and Insertion Sort are stable; equal elements maintain relative order. Selection Sort is not stable.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['bubble-sort', 'optimised'],
        question: 'An optimised bubble sort terminates early when:', options: ['Array length is odd', 'No swaps occur in a full pass', 'i reaches n/2', 'Array is reversed'], correctAnswer: 1,
        explanation: 'If a complete pass makes no swaps, the array is sorted; break early to improve best-case to O(n).'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['selection-sort', 'swaps'],
        question: 'Selection sort makes at most ___ swaps for n elements:', options: ['n²', 'n-1', 'n(n-1)/2', 'log n'], correctAnswer: 1,
        explanation: 'Selection sort swaps once per pass: at most n-1 swaps total, making it useful when writes are costly.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['insertion-sort', 'adaptive'],
        question: 'Insertion sort is adaptive because:', options: ['It uses recursion', 'It performs better on nearly-sorted data', 'It uses a key', 'It merges subarrays'], correctAnswer: 1,
        explanation: 'Fewer inversions mean fewer shifts; nearly-sorted arrays approach O(n) for insertion sort.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['comparison', 'worst-case'],
        question: 'Bubble Sort worst-case number of comparisons for n elements:', options: ['n', 'n-1', 'n(n-1)/2', 'n²'], correctAnswer: 2,
        explanation: 'n(n-1)/2 comparisons in the worst case (reverse sorted array) for Bubble Sort.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['cyclic-sort'],
        question: 'Cyclic Sort works best for arrays containing numbers:', options: ['Any range', 'In range [1, n]', 'Only negatives', 'Floating point'], correctAnswer: 1,
        explanation: 'Cyclic Sort places element i at index i-1; perfect for arrays with integers in [1, n] or [0, n-1]. O(n) time.'
    },
    {
        moduleOrder: 6, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['inversion-count'],
        question: 'Number of inversions in an array directly measures:', options: ['Array length', 'How far the array is from sorted (bubble sort work)', 'Number of duplicates', 'Array sum'], correctAnswer: 1,
        explanation: 'Each swap in bubble sort fixes one inversion; total swaps = total inversions = measure of sortedness.'
    },

    // Topic 6.2 – Advanced Sorting
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['merge-sort', 'paradigm'],
        question: 'Merge Sort uses the paradigm:', options: ['Greedy', 'Divide and Conquer', 'Dynamic Programming', 'Backtracking'], correctAnswer: 1,
        explanation: 'Merge Sort divides the array in half, recursively sorts each half, then merges the sorted halves.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['quick-sort', 'pivot'],
        question: 'Quick Sort uses a _____ element to partition the array:', options: ['Median', 'Minimum', 'Pivot', 'Maximum'], correctAnswer: 2,
        explanation: 'Quick Sort selects a pivot and partitions elements smaller to its left and larger to its right.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['merge-sort', 'stable'],
        question: 'Merge Sort is:', options: ['Unstable, O(n log n)', 'Stable, O(n log n)', 'Stable, O(n²)', 'Unstable, O(n)'], correctAnswer: 1,
        explanation: 'Merge Sort is stable (equal elements maintain order) with guaranteed O(n log n) time complexity.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['quick-sort', 'worst-case'],
        question: 'Quick Sort worst-case time complexity:', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correctAnswer: 2,
        explanation: 'When the pivot is always the smallest/largest element (sorted/reverse-sorted array), quick sort degrades to O(n²).'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['merge-sort', 'space'],
        question: 'Merge Sort space complexity:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 2,
        explanation: 'Merge Sort requires O(n) auxiliary space for the temporary array used during merging.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['quick-sort', 'partition'],
        question: 'Lomuto partition scheme sets the pivot at:', options: ['First position', 'Last position', 'Middle', 'Random'], correctAnswer: 1,
        explanation: 'Lomuto partition uses the last element as pivot, placing it in its correct final position.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['quick-sort', 'randomised'],
        question: 'Randomised Quick Sort achieves expected O(n log n) by:', options: ['Sorting before partitioning', 'Randomly selecting pivot reducing chance of bad splits', 'Using merge at each step', 'Using extra space'], correctAnswer: 1,
        explanation: 'Random pivot selection makes the probability of consistently bad splits extremely low.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['merge-sort', 'inversion'],
        question: 'Merge Sort can count inversions (out-of-order pairs) in:', options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'], correctAnswer: 1,
        explanation: 'During the merge step, when a right element is placed before left elements, add the count of remaining left elements as inversions.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['quick-sort', 'tail-recursion'],
        question: 'To reduce Quick Sort stack space to O(log n):', options: ['Use iterative approach only', 'Recurse on smaller partition first (tail-call optimisation)', 'Use merge instead', 'Add more pivots'], correctAnswer: 1,
        explanation: 'Always recurse on the smaller subarray first; the larger part is handled iteratively → O(log n) stack.'
    },
    {
        moduleOrder: 6, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['three-way-partition'],
        question: 'Three-way partition (Dutch National Flag) handles arrays with:', options: ['Large values', 'Duplicate elements efficiently', 'Negative numbers', 'Float values'], correctAnswer: 1,
        explanation: 'Three-way partition groups equal elements, making Quick Sort O(n log n) even with many duplicates.'
    },

    // Topic 6.3 – Specialised Sorting
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['counting-sort'],
        question: 'Counting Sort works by:', options: ['Comparing elements', 'Counting frequency of each distinct value', 'Dividing and merging', 'Finding pivot'], correctAnswer: 1,
        explanation: 'Counting Sort counts occurrences of each value, then reconstructs the sorted array from counts.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['counting-sort', 'constraint'],
        question: 'Counting Sort is suitable when:', options: ['Elements are arbitrary', 'Elements are in a small known range [0, k]', 'Array has floats', 'Array is already sorted'], correctAnswer: 1,
        explanation: 'Counting Sort is efficient when k (range) is small relative to n; otherwise extra space grows impractical.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['radix-sort'],
        question: 'Radix Sort sorts by:', options: ['Comparing full values', 'Processing digits from least-significant to most-significant', 'Random partitioning', 'Counting occurrences only'], correctAnswer: 1,
        explanation: 'Radix Sort sorts digit by digit (LSD first), using a stable sort (like Counting Sort) at each digit level.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['cyclic-sort', 'application'],
        question: 'Cyclic Sort is ideal for finding:', options: ['Median', 'Missing/duplicate numbers in [1,n] arrays', 'Max subarray', 'Inversion count'], correctAnswer: 1,
        explanation: 'After Cyclic Sort, elements not at their correct index reveal missing or duplicate values.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['counting-sort', 'complexity'],
        question: 'Counting Sort time complexity (n elements, range k):', options: ['O(n log n)', 'O(n + k)', 'O(n × k)', 'O(k log k)'], correctAnswer: 1,
        explanation: 'O(n) to count + O(k) to build output = O(n+k). When k=O(n), this is O(n) – better than comparison sorts.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['radix-sort', 'complexity'],
        question: 'Radix Sort time complexity for n numbers with d digits (base k):', options: ['O(n log n)', 'O(d × (n + k))', 'O(n × d)', 'O(n²)'], correctAnswer: 1,
        explanation: 'd passes, each O(n+k) counting sort → O(d(n+k)). For fixed d and k, this is O(n).'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['non-comparison', 'lower-bound'],
        question: 'Why can non-comparison sorts beat the O(n log n) lower bound?', options: ['They use more space', 'They exploit domain-specific structure of keys (not just comparisons)', 'They are incorrect', 'JVM optimisation'], correctAnswer: 1,
        explanation: 'The Ω(n log n) lower bound applies only to comparison-based sorts. Non-comparison sorts use more information about the data.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['bucket-sort'],
        question: 'Bucket Sort works best when:', options: ['Data is integers only', 'Input is uniformly distributed over a range', 'Data is reverse sorted', 'Array is very large'], correctAnswer: 1,
        explanation: 'Uniform distribution ensures buckets have O(1) average elements; sorting each bucket is fast.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['radix-sort', 'stable'],
        question: 'Radix Sort requires the underlying sort to be:', options: ['Fast only', 'Stable (preserving order of equal elements)', 'In-place', 'Recursive'], correctAnswer: 1,
        explanation: 'Stability is critical: digits processed in later passes must not disturb correct ordering from earlier passes.'
    },
    {
        moduleOrder: 6, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['cyclic-sort', 'duplicates'],
        question: 'Finding all duplicates in [1,n] array using Cyclic Sort runs in:', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'Cyclic Sort places each number at its correct index in O(n). A second scan identifies duplicates in O(n).'
    },

    // -------------------- MODULE 7 – RECURSION --------------------

    // Topic 7.1 – Recursion Fundamentals
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['recursion', 'base-case'],
        question: 'What is the base case in recursion?', options: ['The recursive call', 'The condition that stops recursion', 'The return type', 'The first call'], correctAnswer: 1,
        explanation: 'The base case is the condition under which the function returns without making further recursive calls, preventing infinite recursion.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['recursion', 'stack'],
        question: 'Recursive calls use which memory structure?', options: ['Heap', 'Queue', 'Call Stack', 'Array'], correctAnswer: 2,
        explanation: 'Each recursive call pushes a new stack frame onto the call stack; base case triggers unwinding.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['factorial', 'recursion'],
        question: 'Factorial of n recursively: factorial(n) = ?', options: ['n + factorial(n-1)', 'n * factorial(n-1)', 'factorial(n-1) / n', 'n - factorial(n-1)'], correctAnswer: 1,
        explanation: 'factorial(n) = n × factorial(n-1), with base case factorial(0) = 1.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['fibonacci', 'recursion'],
        question: 'Naive recursive Fibonacci has time complexity:', options: ['O(n)', 'O(n log n)', 'O(2ⁿ)', 'O(n²)'], correctAnswer: 2,
        explanation: 'Each call branches into two, leading to exponential O(2ⁿ) calls without memoization.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['tail-recursion'],
        question: 'Tail recursion means:', options: ['The recursive call is in the middle', 'The recursive call is the last operation before return', 'There are two recursive calls', 'Recursion with no base case'], correctAnswer: 1,
        explanation: 'Tail recursion allows compilers to optimise the call into an iteration (tail call optimisation), avoiding stack growth.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['recursion-tree'],
        question: 'A recursion tree helps in:', options: ['Writing code', 'Visualising all recursive calls and analysing complexity', 'Debugging syntax', 'Memory management'], correctAnswer: 1,
        explanation: 'Kunal uses recursion trees to visualise branching of calls and sum costs at each level for complexity analysis.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['StackOverflow', 'recursion'],
        question: 'StackOverflowError in recursion indicates:', options: ['Too many heap allocations', 'Missing or incorrect base case causing infinite recursion', 'Null pointer', 'Integer overflow'], correctAnswer: 1,
        explanation: 'Without a correct base case, recursion never terminates, exhausting the call stack.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['power', 'recursion'],
        question: 'Efficient power(x, n) using recursion has complexity:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1,
        explanation: 'Fast exponentiation: power(x, n) = power(x², n/2) if n even, x * power(x, n-1) if odd → O(log n).'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['mutual-recursion'],
        question: 'Mutual recursion occurs when:', options: ['A function calls itself', 'Function A calls Function B which calls Function A', 'Two functions share a variable', 'A function returns another function'], correctAnswer: 1,
        explanation: 'Mutual recursion involves two or more functions calling each other; each needs a proper base case.'
    },
    {
        moduleOrder: 7, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['recursion-to-iteration'],
        question: 'Converting recursion to iteration always requires:', options: ['A queue', 'An explicit stack to simulate the call stack', 'More memory', 'Sorted input'], correctAnswer: 1,
        explanation: 'Converting recursive DFS/traversals to iteration requires an explicit stack to replicate the call stack behaviour.'
    },

    // Topic 7.2 – Recursive Problem Solving
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['subsets', 'power-set'],
        question: 'Number of subsets of a set with n elements:', options: ['n', 'n²', '2ⁿ', 'n!'], correctAnswer: 2,
        explanation: 'Each element is either in or out of a subset → 2 choices per element → 2ⁿ total subsets.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['permutations'],
        question: 'Number of permutations of n distinct elements:', options: ['n', '2ⁿ', 'n²', 'n!'], correctAnswer: 3,
        explanation: 'n! permutations exist for n distinct elements.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['Tower-of-Hanoi'],
        question: 'Tower of Hanoi with n discs requires ___ moves:', options: ['n²', '2ⁿ', '2ⁿ - 1', 'n log n'], correctAnswer: 2,
        explanation: 'Minimum moves = 2ⁿ - 1; each disc requires moving all above it, leading to exponential moves.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['dice-throw'],
        question: 'In dice throw recursion, how many recursive calls are made per level?', options: ['1', '2', '6 (one per face)', 'n'], correctAnswer: 2,
        explanation: 'At each position, we try all 6 dice faces, branching into 6 recursive calls.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['subset-sum'],
        question: 'Subset sum recursion at each step:', options: ['Sorts elements', 'Includes or excludes current element', 'Swaps elements', 'Divides array'], correctAnswer: 1,
        explanation: 'Classic inclusion-exclusion: at each index, either include the element in sum or exclude it, exploring both branches.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['permutation', 'swap'],
        question: 'Generating permutations using swap-based recursion swaps element at index i with:', options: ['Index 0', 'Each index from i to n-1', 'Index n-1', 'Random index'], correctAnswer: 1,
        explanation: 'Swap arr[i] with arr[j] for j from i to n-1, recurse on i+1, then swap back to restore state.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['phone-keypad'],
        question: 'Letter combinations of a phone number uses recursion over:', options: ['All digits at once', 'Each digit, trying all its mapped letters', 'Only vowels', 'Random letters'], correctAnswer: 1,
        explanation: 'For each digit, iterate its letters and recurse to the next digit, building combinations character by character.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['subsets-with-duplicates'],
        question: 'To generate subsets without duplicates when input has duplicates:', options: ['Sort input and skip duplicates at same level', 'Use a random seed', 'Reverse the array', 'No special handling needed'], correctAnswer: 0,
        explanation: 'Sort first, then at each level skip duplicate elements (same as previous sibling) to avoid duplicate subsets.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['combination-sum', 'unbounded'],
        question: 'Combination Sum (can reuse elements) recurses with:', options: ['i+1 for next call', 'i (same index) for reuse, i+1 to move on', 'Random index', 'Start index reset to 0'], correctAnswer: 1,
        explanation: 'To allow reuse, the recursive call with the same element passes i (not i+1) as the start index.'
    },
    {
        moduleOrder: 7, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['Tower-of-Hanoi', 'recursion'],
        question: 'Tower of Hanoi time complexity O(2ⁿ - 1) arises because:', options: ['Linear growth', 'Each disc requires moving all discs above → exponential calls', 'Random branching', 'Sorting occurs'], correctAnswer: 1,
        explanation: 'T(n) = 2T(n-1) + 1 solves to O(2ⁿ), matching the minimum move count of 2ⁿ - 1.'
    },

    // Topic 7.3 – Backtracking
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['backtracking'],
        question: 'Backtracking prunes the search space by:', options: ['Sorting options', 'Abandoning a path when a constraint is violated', 'Using dynamic programming', 'Random sampling'], correctAnswer: 1,
        explanation: 'Backtracking tries options and backs up (undoes choices) when a constraint is violated, avoiding fruitless branches.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['N-Queens', 'constraint'],
        question: 'N-Queens constraint: a queen attacks:', options: ['Only forward', 'Row, column, and both diagonals', 'Only diagonals', 'Only row and column'], correctAnswer: 2,
        explanation: 'Queens attack in all 8 directions: horizontally, vertically, and diagonally. Placement must avoid all attacks.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['Sudoku', 'constraint'],
        question: 'Sudoku constraints are:', options: ['Each row unique', 'Each row, column, and 3×3 box unique', 'Each column unique only', 'Each row and column unique'], correctAnswer: 1,
        explanation: 'Sudoku requires digits 1-9 to appear exactly once in each row, column, and each of the nine 3×3 sub-grids.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['backtracking', 'undo'],
        question: 'The "undo" step in backtracking is called:', options: ['Prune', 'Backtrack (restore state)', 'Recurse', 'Branch'], correctAnswer: 1,
        explanation: 'After exploring a branch, restore the state (undo the last choice) before trying the next option.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['N-Queens', 'valid-placement'],
        question: 'Checking if a queen placement is valid requires verifying:', options: ['Row only', 'Column, left-diagonal, right-diagonal', 'Row and column only', 'All 8 neighbours'], correctAnswer: 1,
        explanation: 'Since we place one queen per row, check: no queen in same column, no queen on upper-left diagonal, no queen on upper-right diagonal.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['backtracking', 'complexity'],
        question: 'N-Queens worst-case complexity is approximately:', options: ['O(n!)', 'O(n²)', 'O(2ⁿ)', 'O(n log n)'], correctAnswer: 0,
        explanation: 'N-Queens explores O(n!) possibilities in the worst case (one queen per row, n choices each) with pruning reducing practical time.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['maze', 'backtracking'],
        question: 'Rat in a maze backtracking marks cells as visited to:', options: ['Speed up printing', 'Avoid revisiting cells (cycles)', 'Sort the path', 'Count steps'], correctAnswer: 1,
        explanation: 'Marking visited cells prevents infinite loops from revisiting the same cell in different paths.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['sudoku', 'empty-cell'],
        question: 'Sudoku solver recursion tries digits ___ in each empty cell:', options: ['1 and 2', '1 to 9', '0 to 8', 'Depends on row'], correctAnswer: 1,
        explanation: 'Try digits 1-9 in each empty cell; recurse if placement is valid. Backtrack if none works.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['N-Knights'],
        question: 'N-Knights problem (place n non-attacking knights) is harder than N-Queens because:', options: ['Knights move in L-shape making conflict checking more complex', 'Knights are faster', 'Board is larger', 'Queens have more power'], correctAnswer: 0,
        explanation: 'Knight attacks in L-shapes; checking conflicts requires considering up to 8 positions per knight, unlike queens.'
    },
    {
        moduleOrder: 7, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['word-search', 'backtracking'],
        question: 'Word Search on a grid using backtracking has complexity:', options: ['O(m×n)', 'O(m×n × 4^L) where L is word length', 'O(L)', 'O(m×n log(m×n))'], correctAnswer: 1,
        explanation: 'Start from each cell (m×n), explore up to 4 directions at each of L steps: O(m×n × 4^L) worst case.'
    },

    // -------------------- MODULE 8 – LINKED LISTS --------------------

    // Topic 8.1 – Singly Linked List
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linked-list', 'node'],
        question: 'Each node in a singly linked list contains:', options: ['Data only', 'Data and previous pointer', 'Data and next pointer', 'Data and two pointers'], correctAnswer: 2,
        explanation: 'A singly linked list node has a data field and a next pointer to the following node.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linked-list', 'head'],
        question: 'The head of a linked list points to:', options: ['The last node', 'The middle node', 'The first node', 'Null'], correctAnswer: 2,
        explanation: 'Head is the reference to the first node; following next pointers traverses the list.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linked-list', 'insertion'],
        question: 'Inserting at the beginning of a singly linked list is:', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'Create new node, set its next = head, update head = new node. No traversal needed → O(1).'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['linked-list', 'deletion'],
        question: 'Deleting a node given its previous node pointer is:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], correctAnswer: 2,
        explanation: 'prev.next = prev.next.next removes the target node in O(1) time.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['linked-list', 'search'],
        question: 'Searching for a value in a singly linked list:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2,
        explanation: 'Must traverse potentially all nodes to find the value → O(n) in worst case.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['reverse-linked-list'],
        question: 'Reversing a singly linked list iteratively requires pointers:', options: ['Only head', 'prev, current, next', 'Two pointers', 'Four pointers'], correctAnswer: 1,
        explanation: 'Three pointers: prev (initially null), current, next – traverse and reverse each link in O(n), O(1) space.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['linked-list', 'advantages'],
        question: 'Linked lists have advantages over arrays in:', options: ['Random access speed', 'Cache performance', 'Dynamic insertion/deletion (no shifting)', 'Index-based access'], correctAnswer: 2,
        explanation: 'No need to shift elements for insertion/deletion in linked lists; arrays require O(n) shifts.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['nth-from-end'],
        question: 'Finding the nth node from end in one pass uses:', options: ['Sorting', 'Two pointers (n apart)', 'Stack', 'Binary search'], correctAnswer: 1,
        explanation: 'Move one pointer n steps ahead, then advance both until the leader reaches the end; the follower is at nth from end.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['linked-list', 'mid-point'],
        question: 'Finding the middle of a linked list uses:', options: ['Two pointers: slow (1 step) and fast (2 steps)', 'Sorting', 'Counting then halving (two passes)', 'Random access'], correctAnswer: 0,
        explanation: 'Slow/fast pointer (tortoise and hare): when fast reaches end, slow is at middle. One pass, O(1) space.'
    },
    {
        moduleOrder: 8, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['merge-sorted-LL'],
        question: 'Merging two sorted linked lists in O(m+n) works by:', options: ['Sorting both again', 'Comparing heads and linking the smaller node recursively/iteratively', 'Appending and sorting', 'Converting to arrays'], correctAnswer: 1,
        explanation: 'Compare head nodes, link the smaller, advance that pointer, repeat until both lists are exhausted.'
    },

    // Topic 8.2 – Doubly Linked List & Reversal
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['DLL', 'prev-pointer'],
        question: 'A doubly linked list node contains:', options: ['Data and next only', 'Data, next, and prev', 'Data and two next pointers', 'Data only'], correctAnswer: 1,
        explanation: 'DLL nodes have data, a next pointer (forward), and a prev pointer (backward).'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['DLL', 'bidirectional'],
        question: 'Advantage of doubly linked list over singly:', options: ['Less memory', 'Bidirectional traversal', 'Faster search', 'Random access'], correctAnswer: 1,
        explanation: 'DLL allows traversal in both directions; deletion is easier since we can access the previous node directly.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['DLL', 'delete'],
        question: 'Deleting a known node in a DLL (with prev/next pointers):', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'node.prev.next = node.next and node.next.prev = node.prev – O(1) deletion with direct access.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['fast-slow-pointer'],
        question: 'The fast/slow pointer technique advances fast pointer:', options: ['1 step at a time', '2 steps at a time', 'n steps at a time', 'Random steps'], correctAnswer: 1,
        explanation: 'Fast moves 2 nodes per step, slow moves 1; when fast reaches end, slow is at the midpoint.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['DLL', 'reverse'],
        question: 'Reversing a doubly linked list: swap next and prev for:', options: ['Only the head', 'Only the tail', 'Every node', 'Middle nodes only'], correctAnswer: 2,
        explanation: 'For each node, swap its next and prev pointers; update head to the last node visited.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['recursion-LL'],
        question: 'Reversing a linked list recursively: what does the base case return?', options: ['Null', 'Head when head.next == null', 'Middle node', 'New head'], correctAnswer: 1,
        explanation: 'Base case: if head == null or head.next == null, return head (single/empty list already reversed).'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['LL-with-recursion'],
        question: 'Recursion on linked lists uses O(_) stack space:', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'Each recursive call adds one stack frame; for n nodes there are n frames → O(n) space.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['palindrome-LL'],
        question: 'Checking if a linked list is a palindrome in O(n) time, O(1) space:', options: ['Use HashMap', 'Find mid, reverse second half, compare', 'Sort and compare', 'Use recursion'], correctAnswer: 1,
        explanation: 'Find mid (slow/fast), reverse the second half in-place, compare both halves, then restore.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['DLL', 'memory'],
        question: 'DLL uses more memory than SLL because:', options: ['Larger data fields', 'An extra pointer (prev) per node', 'More nodes', 'Different allocation'], correctAnswer: 1,
        explanation: 'Each DLL node stores an extra reference (prev), adding one pointer\'s worth of memory per node.'
    },
    {
        moduleOrder: 8, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['k-reverse-LL'],
        question: 'Reversing a linked list in groups of k has time complexity:', options: ['O(k)', 'O(n/k)', 'O(n)', 'O(n×k)'], correctAnswer: 2,
        explanation: 'Every node is visited and pointer reversed exactly once → O(n) regardless of k.'
    },

    // Topic 8.3 – Circular Linked List & Cycle Detection
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['circular-LL'],
        question: 'In a circular linked list, the last node points to:', options: ['Null', 'A random node', 'The head (first node)', 'The middle node'], correctAnswer: 2,
        explanation: 'The last node\'s next pointer points back to the head, forming a circle.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['cycle-detection', 'Floyd'],
        question: 'Floyd\'s cycle detection uses:', options: ['Hash set', 'Three pointers', 'Two pointers (slow + fast)', 'Sorting'], correctAnswer: 2,
        explanation: 'Floyd\'s algorithm uses slow (1 step) and fast (2 steps) pointers; they meet inside a cycle if one exists.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['cycle', 'detection'],
        question: 'If no cycle exists in Floyd\'s algorithm, fast pointer reaches:', options: ['Slow pointer', 'Head', 'Null', 'Middle'], correctAnswer: 2,
        explanation: 'Without a cycle, the fast pointer reaches null (end of list) without ever meeting the slow pointer.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['circular-LL', 'insertion'],
        question: 'Inserting at end of circular linked list requires updating:', options: ['Only new node\'s next', 'Only head', 'Both new node\'s next to head and tail\'s next to new node', 'No pointers'], correctAnswer: 2,
        explanation: 'New node.next = head; old tail.next = new node; update tail reference. Maintains the circular structure.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['cycle-entry', 'Floyd'],
        question: 'Finding the cycle entry point after detection: after meeting, one pointer moves to head, both advance __ step at a time until they meet:', options: ['Two', 'Random', 'One', 'Three'], correctAnswer: 2,
        explanation: 'After first meeting, move one pointer to head; advance both one step at a time. They meet at the cycle entry point.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['cycle-length'],
        question: 'Finding cycle length after detection:', options: ['Count from head', 'Keep one pointer fixed, advance the other until it returns to meeting point – count steps', 'Use slow pointer speed', 'Check node values'], correctAnswer: 1,
        explanation: 'Hold one pointer at meeting point; advance the other until it loops back; count steps = cycle length.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['circular-LL', 'traversal'],
        question: 'Traversing a circular linked list requires stopping when:', options: ['Next is null', 'We reach index n', 'We return to head (or starting node)', 'We find a null prev'], correctAnswer: 2,
        explanation: 'Stop when current.next == head (or current == head in the next iteration) to avoid infinite traversal.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['happy-number', 'cycle'],
        question: '"Happy Number" problem uses cycle detection to identify:', options: ['Prime numbers', 'Numbers that cycle without reaching 1', 'Numbers equal to their digit sum', 'Even numbers'], correctAnswer: 1,
        explanation: 'Happy numbers reach 1; unhappy numbers enter a cycle. Floyd\'s algorithm detects the cycle for O(1) space.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['Floyd', 'mathematical-proof'],
        question: 'Why does Floyd\'s algorithm guarantee the two pointers meet in a cycle?', options: ['Random chance', 'Fast reduces distance to slow by 1 each step in the cycle → guaranteed convergence', 'They are in the same memory location', 'Cycle is always even length'], correctAnswer: 1,
        explanation: 'Inside a cycle, fast gains on slow by 1 step per cycle iteration; distance decreases to 0 in at most (cycle_length) steps.'
    },
    {
        moduleOrder: 8, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['Floyd', 'O(1)-space'],
        question: 'Floyd\'s cycle detection space complexity:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(cycle length)'], correctAnswer: 2,
        explanation: 'Only two pointers (slow and fast) are used regardless of list size → O(1) extra space.'
    },

    // -------------------- MODULE 9 – STACK & QUEUE --------------------

    // Topic 9.1 – Stack Implementation
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['stack', 'LIFO'],
        question: 'Stack follows ___ order:', options: ['FIFO', 'LIFO', 'Random', 'Sorted'], correctAnswer: 1,
        explanation: 'LIFO – Last In, First Out. The last element pushed is the first popped.'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['stack', 'operations'],
        question: 'Core stack operations are:', options: ['add, remove', 'push, pop, peek', 'enqueue, dequeue', 'insert, delete'], correctAnswer: 1,
        explanation: 'Push adds to top, pop removes from top, peek views top without removing – the fundamental stack operations.'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['stack', 'balanced-parens'],
        question: 'Balanced parentheses checking uses stack because:', options: ['Stacks are sorted', 'Matching closing brackets to the most recent opening bracket uses LIFO', 'Queues are too slow', 'Arrays cannot store characters'], correctAnswer: 1,
        explanation: 'LIFO ensures the most recently opened bracket is checked first when a closing bracket is encountered.'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['stack', 'underflow'],
        question: 'Popping from an empty stack causes:', options: ['Returns null', 'StackOverflowError', 'EmptyStackException / underflow', 'Returns -1'], correctAnswer: 2,
        explanation: 'Attempting to pop an empty stack throws an exception (underflow condition).'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['stack', 'push-efficient'],
        question: 'Push-efficient stack using two queues: push is O(1), pop is:', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'Pop in a push-efficient two-queue stack requires moving all-but-one elements, making it O(n).'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['infix-postfix'],
        question: 'Converting infix to postfix expression uses a stack to:', options: ['Sort operators', 'Handle operator precedence and parentheses', 'Store operands', 'Print results'], correctAnswer: 1,
        explanation: 'Stack holds operators and manages precedence/associativity during infix-to-postfix conversion.'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['stack', 'monotonic'],
        question: 'A monotonic stack maintains elements in:', options: ['Random order', 'Strictly increasing or strictly decreasing order', 'Sorted order', 'FIFO order'], correctAnswer: 1,
        explanation: 'Monotonic stack pops elements that violate monotonicity, useful for next greater element problems.'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['stack', 'DFS'],
        question: 'DFS uses a stack (explicitly or via recursion) because:', options: ['FIFO is needed', 'LIFO matches exploring deep branches before backtracking', 'Stacks are faster', 'DFS is sorted'], correctAnswer: 1,
        explanation: 'DFS explores as deep as possible before backtracking – LIFO of a stack matches this depth-first behaviour.'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['largest-histogram', 'stack'],
        question: 'Largest rectangle in histogram optimal solution uses:', options: ['Sorting', 'A monotonic stack in O(n)', 'Two-pointer O(n)', 'DP O(n²)'], correctAnswer: 1,
        explanation: 'A monotonic (increasing) stack tracks bars; when a smaller bar is found, pop and calculate areas → O(n).'
    },
    {
        moduleOrder: 9, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['stack', 'min-stack'],
        question: 'Min Stack (getMin in O(1)) uses:', options: ['Sorted array', 'Two stacks: main and auxiliary min-stack', 'Heap', 'Binary search'], correctAnswer: 1,
        explanation: 'Auxiliary stack tracks minimum values; push current min alongside each element → O(1) getMin.'
    },

    // Topic 9.2 – Queue & Circular Queue
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['queue', 'FIFO'],
        question: 'Queue follows ___ order:', options: ['LIFO', 'FIFO', 'Random', 'Priority'], correctAnswer: 1,
        explanation: 'FIFO – First In, First Out. The first element enqueued is the first dequeued.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['circular-queue'],
        question: 'Circular queue solves the problem of:', options: ['Sorting', 'Wasted space in linear queue after dequeues (false overflow)', 'Stack overflow', 'Memory leaks'], correctAnswer: 1,
        explanation: 'After dequeues in a linear array queue, front advances, wasting space. Circular queue reuses that space modulo capacity.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['queue', 'BFS'],
        question: 'BFS uses a queue because:', options: ['LIFO explores depth first', 'FIFO explores level by level', 'Queues are sorted', 'Stacks are too slow for graphs'], correctAnswer: 1,
        explanation: 'BFS processes nodes level by level; FIFO of a queue ensures all nodes at depth d are processed before depth d+1.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['queue-using-stack'],
        question: 'Implementing queue using two stacks: enqueue is O(1), dequeue is:', options: ['O(1)', 'O(n) amortized', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'Amortized: each element is pushed/popped at most twice, making dequeue O(1) amortized despite O(n) occasional transfers.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['circular-queue', 'index'],
        question: 'In circular queue, next index after rear = (rear + 1) % capacity, which handles:', options: ['Sorting', 'Wrap-around when rear reaches capacity-1', 'Priority ordering', 'Duplicate removal'], correctAnswer: 1,
        explanation: 'Modulo operation wraps the rear pointer back to 0 when it reaches the array end, reusing freed space.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['queue', 'interleave'],
        question: 'Interleaving first and second halves of a queue uses:', options: ['A stack', 'Another queue', 'Only the queue itself', 'Recursion'], correctAnswer: 0,
        explanation: 'Push first half onto a stack (reverses order), then interleave from stack and queue alternately.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['queue', 'sliding-window-max'],
        question: 'Sliding window maximum uses a deque (double-ended queue) to achieve:', options: ['O(n²)', 'O(n) total', 'O(n log n)', 'O(k) per window'], correctAnswer: 1,
        explanation: 'Deque stores indices of potential maximums; each element enters and exits the deque once → O(n) total.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['LRU-cache', 'queue'],
        question: 'LRU Cache evicts the:', options: ['Most recently used item', 'Least recently used item', 'Smallest item', 'Largest item'], correctAnswer: 1,
        explanation: 'LRU (Least Recently Used) evicts the item that has not been accessed for the longest time.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['LRU', 'HashMap-DLL'],
        question: 'Optimal O(1) LRU Cache uses:', options: ['Array + binary search', 'HashMap + Doubly Linked List', 'Two queues', 'Priority queue'], correctAnswer: 1,
        explanation: 'HashMap provides O(1) access; DLL provides O(1) removal and reordering. Together: O(1) get and put.'
    },
    {
        moduleOrder: 9, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['queue', 'circular-buffer'],
        question: 'Circular buffer (ring buffer) queue full condition: (rear + 1) % capacity == front means:', options: ['Queue is empty', 'Queue is full', 'One slot is reserved for distinguishing full/empty', 'Queue has one element'], correctAnswer: 1,
        explanation: 'The one-slot-reserved convention: if advancing rear would equal front, the queue is considered full (n-1 capacity used).'
    },

    // Topic 9.3 – Deque & PriorityQueue
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['deque'],
        question: 'Deque stands for:', options: ['Delayed Queue', 'Double-Ended Queue', 'Dynamic Queue', 'Duplicate Queue'], correctAnswer: 1,
        explanation: 'Deque (Double-Ended Queue) allows insertion and deletion from both front and rear ends.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['PriorityQueue', 'heap'],
        question: 'Java PriorityQueue is backed by:', options: ['LinkedList', 'Array-based heap', 'BST', 'Skip list'], correctAnswer: 1,
        explanation: 'Java\'s PriorityQueue is implemented as a binary min-heap stored in an array.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['PriorityQueue', 'default'],
        question: 'Default ordering of Java PriorityQueue is:', options: ['Max heap', 'Min heap', 'Sorted insertion order', 'Random'], correctAnswer: 1,
        explanation: 'Default PriorityQueue in Java is a min-heap; poll() returns the smallest element.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['PriorityQueue', 'complexity'],
        question: 'PriorityQueue offer() and poll() complexity:', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], correctAnswer: 2,
        explanation: 'Heap operations (insert/remove) maintain the heap property via sifting → O(log n).'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['PriorityQueue', 'max-heap'],
        question: 'To create a max-heap PriorityQueue in Java:', options: ['new PriorityQueue<>(Collections.reverseOrder())', 'new PriorityQueue<>()', 'new MaxHeap<>()', 'new PriorityQueue<>(Comparator.max())'], correctAnswer: 0,
        explanation: 'Pass Collections.reverseOrder() or `(a, b) -> b - a` comparator for max-heap behaviour.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['deque', 'sliding-window'],
        question: 'ArrayDeque is preferred over LinkedList for deque operations because:', options: ['Better worst-case', 'Better cache performance (array-based)', 'Supports generics', 'Has more methods'], correctAnswer: 1,
        explanation: 'ArrayDeque uses a circular array; better cache locality than LinkedList\'s node-based structure → faster in practice.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['k-largest', 'PriorityQueue'],
        question: 'Finding k largest elements using PriorityQueue optimally:', options: ['Max-heap of all elements, poll k times', 'Min-heap of size k, add each element and evict if too large', 'Sort array', 'Linear scan k times'], correctAnswer: 1,
        explanation: 'Min-heap of size k: if new element > heap top, replace top → O(n log k) time, O(k) space.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['top-k-frequent'],
        question: 'Top-k frequent elements problem uses:', options: ['Stack', 'PriorityQueue (min-heap) + HashMap', 'Two queues', 'Sorting only'], correctAnswer: 1,
        explanation: 'HashMap for frequencies, min-heap of size k for top-k; process all elements in O(n log k).'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['k-way-merge'],
        question: 'k-way merge of k sorted lists using PriorityQueue runs in:', options: ['O(n×k)', 'O(n log k)', 'O(n)', 'O(k log n)'], correctAnswer: 1,
        explanation: 'Each of the n total elements is pushed/popped from a heap of size k → O(n log k) total.'
    },
    {
        moduleOrder: 9, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['median-data-stream'],
        question: 'Finding median from data stream uses:', options: ['Single sorted array', 'Two heaps (max-heap for lower half, min-heap for upper half)', 'Binary search tree', 'Queue'], correctAnswer: 1,
        explanation: 'Max-heap holds lower half, min-heap holds upper half; median is top of one or average of both tops. O(log n) insert, O(1) median.'
    },

    // -------------------- MODULE 10 – TREES --------------------

    // Topic 10.1 – Binary Tree Fundamentals
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['binary-tree', 'definition'],
        question: 'A binary tree node has at most ___ children:', options: ['1', '2', '3', 'Unlimited'], correctAnswer: 1,
        explanation: 'Binary tree: each node has at most 2 children – left and right.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['height', 'depth'],
        question: 'Height of a binary tree is:', options: ['Number of nodes', 'Number of edges on longest root-to-leaf path', 'Number of leaves', 'Number of internal nodes'], correctAnswer: 1,
        explanation: 'Height = number of edges on the longest path from root to a leaf node.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['level-order', 'BFS'],
        question: 'Level order traversal uses:', options: ['Stack', 'Queue', 'Recursion only', 'Priority queue'], correctAnswer: 1,
        explanation: 'Level order (BFS) uses a queue to process nodes level by level: enqueue root, process, enqueue children.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['full-binary-tree'],
        question: 'A full binary tree has nodes with either ___ children:', options: ['0 only', '0 or 2', '1 or 2', '0,1, or 2'], correctAnswer: 1,
        explanation: 'Full binary tree: every node has either 0 (leaf) or 2 children – no nodes with exactly 1 child.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['count-nodes'],
        question: 'Number of nodes in a complete binary tree of height h:', options: ['h', '2^h', '2^(h+1) - 1', 'h²'], correctAnswer: 2,
        explanation: 'Complete binary tree with height h has 2^(h+1) - 1 nodes when perfectly filled.' 
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['diameter'],
        question: 'Diameter of a binary tree is:', options: ['Maximum depth', 'Longest path between any two nodes (may not pass through root)', 'Number of leaves', 'Root height'], correctAnswer: 1,
        explanation: 'Diameter = longest path between any two leaf nodes; at each node compute left_depth + right_depth.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['balanced-tree'],
        question: 'A balanced binary tree\'s height is:', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 1,
        explanation: 'A balanced tree has O(log n) height, ensuring efficient O(log n) search operations.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['path-sum'],
        question: 'Path sum problem (root to leaf) uses which traversal?', options: ['Level order', 'DFS (preorder/postorder)', 'Inorder only', 'Reverse BFS'], correctAnswer: 1,
        explanation: 'DFS is natural for root-to-leaf paths: carry accumulated sum down the recursion.'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['lowest-common-ancestor'],
        question: 'Lowest Common Ancestor (LCA) of two nodes uses DFS with:', options: ['O(n) time', 'O(n²) time', 'Binary search', 'Topological sort'], correctAnswer: 0,
        explanation: 'DFS visits each node once to find LCA: O(n) time, O(h) space (recursion stack).'
    },
    {
        moduleOrder: 10, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['serialize-deserialize'],
        question: 'Serializing a binary tree uses ___ traversal to preserve structure:', options: ['Inorder only', 'Preorder with null markers OR level order', 'Postorder only', 'BFS without null markers'], correctAnswer: 1,
        explanation: 'Preorder with null markers uniquely reconstructs the tree; null markers are essential to encode structure.'
    },

    // Topic 10.2 – Binary Search Tree
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['BST', 'property'],
        question: 'BST property: for any node n:', options: ['Left subtree > n, right subtree < n', 'Left subtree < n, right subtree > n', 'All nodes equal', 'Random order'], correctAnswer: 1,
        explanation: 'BST: left child < parent < right child – this ordering enables O(log n) search in balanced BSTs.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['BST', 'search'],
        question: 'Search in a balanced BST has complexity:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Each comparison eliminates half the tree → O(log n) for balanced BST, O(n) worst case (skewed).'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['BST', 'inorder'],
        question: 'Inorder traversal of a BST produces:', options: ['Random order', 'Sorted ascending order', 'Reverse sorted', 'Level order'], correctAnswer: 1,
        explanation: 'BST inorder (left, root, right) visits nodes in ascending sorted order – a key BST property.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['BST', 'insert'],
        question: 'Inserting in a BST: compare with current node and go:', options: ['Left always', 'Right always', 'Left if smaller, right if larger', 'Random direction'], correctAnswer: 2,
        explanation: 'If value < node: go left; if value > node: go right; insert at null position found.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['BST', 'delete'],
        question: 'Deleting a node with two children in BST uses:', options: ['Direct deletion', 'Inorder successor (or predecessor) replacement', 'Moving all nodes', 'BFS'], correctAnswer: 1,
        explanation: 'Replace with inorder successor (smallest in right subtree) or inorder predecessor, then delete that successor.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['validate-BST'],
        question: 'Validating a BST requires passing ___ bounds in recursion:', options: ['Only parent value', 'Min and max bounds for each subtree', 'Depth only', 'Nothing extra'], correctAnswer: 1,
        explanation: 'Pass (min, max) range; each node must satisfy min < node.val < max. Subtree bounds tighten at each level.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['BST', 'kth-smallest'],
        question: 'Finding kth smallest element in BST uses:', options: ['Level order + sort', 'Inorder traversal (iterative or recursive)', 'BFS', 'Binary search on values'], correctAnswer: 1,
        explanation: 'Inorder traversal visits nodes in ascending order; stop at the kth node visited.' 
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['BST', 'floor-ceil'],
        question: 'Floor in BST (largest node ≤ key) uses:', options: ['Inorder traversal', 'Modified BST search tracking best candidate', 'BFS', 'Sorting'], correctAnswer: 1,
        explanation: 'Search BST: when node.val ≤ key, it\'s a candidate for floor; go right. When node.val > key, go left.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['BST', 'to-sorted-DLL'],
        question: 'Converting BST to sorted doubly linked list in O(n) time, O(1) space uses:', options: ['Copying to array', 'Morris traversal', 'BFS', 'Sorting'], correctAnswer: 1,
        explanation: 'Morris inorder traversal modifies tree links temporarily to achieve O(n) time without extra space.'
    },
    {
        moduleOrder: 10, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['BST', 'augmented'],
        question: 'Order statistic tree (augmented BST) stores ___ extra info per node:', options: ['Parent pointer', 'Size of subtree rooted at node', 'Height', 'Color'], correctAnswer: 1,
        explanation: 'Storing subtree size enables O(log n) kth-order statistics and rank queries.'
    },

    // Topic 10.3 – Tree Traversals & Views
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['inorder'],
        question: 'Inorder traversal visits nodes in order:', options: ['Root, Left, Right', 'Left, Root, Right', 'Left, Right, Root', 'Right, Root, Left'], correctAnswer: 1,
        explanation: 'Inorder: Left → Root → Right. For BST, this gives ascending sorted order.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['preorder'],
        question: 'Preorder traversal is used for:', options: ['Sorted output', 'Copying/cloning a tree (visits root before children)', 'Finding LCA', 'Counting leaves'], correctAnswer: 1,
        explanation: 'Preorder (Root, Left, Right) is used for tree cloning and serialization since root is processed first.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['postorder'],
        question: 'Postorder traversal is used for:', options: ['Level order output', 'Deleting tree (children deleted before parent)', 'Sorted output', 'BFS'], correctAnswer: 1,
        explanation: 'Postorder (Left, Right, Root) processes children before parent – ideal for deletion and expression evaluation.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['right-view'],
        question: 'Right view of a binary tree is:', options: ['Rightmost nodes at each level', 'All right children', 'Nodes visible from the right side (last node per level)', 'Right subtree only'], correctAnswer: 2,
        explanation: 'Right view = the last node seen at each level when looking from the right – BFS collecting last node per level.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['top-view'],
        question: 'Top view uses ___ to track horizontal distance of each node:', options: ['Height', 'Depth', 'Horizontal distance (HD) from root', 'Node value'], correctAnswer: 2,
        explanation: 'BFS with HD tracking: first node at each HD forms the top view. Use a HashMap<HD, nodeVal>.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['boundary-traversal'],
        question: 'Boundary traversal of a tree includes:', options: ['Only leaves', 'Left boundary + leaves + right boundary (in order)', 'Only internal nodes', 'Level order without nulls'], correctAnswer: 1,
        explanation: 'Boundary = left boundary top-down (excluding leaf) + all leaves L-to-R + right boundary bottom-up (excluding leaf).'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['iterative-inorder'],
        question: 'Iterative inorder traversal uses a:', options: ['Queue', 'Stack', 'Priority queue', 'Two pointers'], correctAnswer: 1,
        explanation: 'Simulate the call stack explicitly: push left nodes, process when popping, then push right subtree.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['vertical-order'],
        question: 'Vertical order traversal groups nodes by:', options: ['Depth', 'Horizontal distance from root', 'Height', 'Node value'], correctAnswer: 1,
        explanation: 'Nodes with the same horizontal distance are in the same vertical line; sorted by depth within the same HD.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['Morris-traversal'],
        question: 'Morris Traversal achieves inorder in O(n) time, O(1) space by:', options: ['Using a queue', 'Temporarily threading the tree (using null right pointers as links)', 'Sorting node values', 'Two-pointer on array'], correctAnswer: 1,
        explanation: 'Morris traversal uses rightmost node of left subtree as a temporary link back, enabling O(1) space traversal.'
    },
    {
        moduleOrder: 10, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['diagonal-traversal'],
        question: 'Diagonal traversal groups nodes where diagonal index = row - col. Time complexity:', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(h)'], correctAnswer: 1,
        explanation: 'Each node is visited once; BFS with diagonal index tracking gives O(n) time.'
    },

    // -------------------- MODULE 11 – HEAPS & HASHING --------------------

    // Topic 11.1 – Heap Data Structure
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['heap', 'property'],
        question: 'Min-heap property: every node is ___ than its children:', options: ['Greater', 'Smaller or equal', 'Equal', 'Random'], correctAnswer: 1,
        explanation: 'In a min-heap, the parent is always ≤ its children, ensuring the root is the minimum element.'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['heap', 'array-representation'],
        question: 'For a heap node at index i (0-based), children are at:', options: ['2i and 2i+1', '2i+1 and 2i+2', 'i/2 and i/2+1', 'i-1 and i+1'], correctAnswer: 1,
        explanation: '0-based heap: left child at 2i+1, right child at 2i+2, parent at (i-1)/2.'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['heap', 'insert'],
        question: 'Inserting in a heap then fixing heap property is called:', options: ['Heapify-down', 'Heapify-up (bubble up / sift up)', 'Merge', 'Sort'], correctAnswer: 1,
        explanation: 'After insertion at the end, sift-up (heapify-up) restores heap property by swapping up until correct.' 
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['heapsort'],
        question: 'Heap Sort time complexity:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 1,
        explanation: 'Heapify is O(n); extracting n elements is O(n log n) → O(n log n) total for Heap Sort.'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['build-heap'],
        question: 'Building a heap from an array of n elements is:', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correctAnswer: 1,
        explanation: 'Applying heapify-down from the last internal node upwards is O(n) – better than n insertions.'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['kth-largest', 'heap'],
        question: 'Finding kth largest element using min-heap of size k takes:', options: ['O(n)', 'O(n log k)', 'O(k)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Process each of n elements; if larger than heap top, replace it → O(log k) per element → O(n log k).'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['heap', 'delete'],
        question: 'Deleting an arbitrary element from a heap (not root) requires:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Replace with last element, remove last, then sift up or sift down to restore heap property → O(log n).'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['two-heap', 'median'],
        question: 'Two-heap method for running median: max-heap for lower half, min-heap for upper half. Rebalancing is done to ensure:', options: ['Both heaps equal size always', 'Size difference ≤ 1', 'Max-heap always smaller', 'Heaps sorted internally'], correctAnswer: 1,
        explanation: 'Size difference ≤ 1 ensures the median is the top of the larger heap or average of both tops.'
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['d-ary-heap'],
        question: 'A d-ary heap has insert O(log_d n) and delete-min O(d log_d n). For large d:', options: ['Insert slower, delete faster', 'Insert faster, delete slower', 'Both faster', 'Both slower'], correctAnswer: 1,
        explanation: 'Higher branching factor d reduces height (log_d n) → faster insert, but delete-min must check d children at each level.' 
    },
    {
        moduleOrder: 11, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['Fibonacci-heap'],
        question: 'Fibonacci Heap achieves amortized O(1) decrease-key, making Dijkstra\'s run in:', options: ['O(V² log V)', 'O((V+E) log V)', 'O(E + V log V)', 'O(VE)'], correctAnswer: 2,
        explanation: 'With Fibonacci heap: O(E + V log V) for Dijkstra, optimal for dense graphs.' 
    },

    // Topic 11.2 – HashMap & HashSet Internals
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['HashMap', 'hashing'],
        question: 'A HashMap stores key-value pairs using:', options: ['Sorted tree', 'Hash function mapping keys to bucket indices', 'Linear search', 'Binary search'], correctAnswer: 1,
        explanation: 'HashMap applies a hash function to the key to determine the bucket index for O(1) average access.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['collision', 'chaining'],
        question: 'Collision handling in Java HashMap uses:', options: ['Open addressing', 'Separate chaining (LinkedList, TreeNode for 8+)', 'Probing', 'Rehashing only'], correctAnswer: 1,
        explanation: 'Java HashMap uses separate chaining; when chain length exceeds 8, it converts to a TreeNode (Red-Black Tree) for O(log n) access.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['HashMap', 'complexity'],
        question: 'Average-case time for HashMap get() and put():', options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'], correctAnswer: 2,
        explanation: 'With a good hash function and low load factor, HashMap operations are O(1) average.' 
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['HashSet'],
        question: 'HashSet in Java is backed by:', options: ['LinkedList', 'TreeSet', 'HashMap (keys only)', 'Array'], correctAnswer: 2,
        explanation: 'HashSet internally uses a HashMap with dummy values; keys serve as the set elements.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['load-factor', 'rehash'],
        question: 'Default load factor of Java HashMap is:', options: ['0.5', '0.75', '1.0', '0.25'], correctAnswer: 1,
        explanation: 'Java HashMap rehashes when size > capacity × 0.75 (default load factor), balancing time/space.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['hash-function', 'distribution'],
        question: 'A good hash function produces:', options: ['Sorted output', 'Uniform distribution across buckets', 'Clustered output', 'Only prime values'], correctAnswer: 1,
        explanation: 'Uniform distribution minimises collisions, maintaining O(1) average HashMap operations.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['LinkedHashMap'],
        question: 'LinkedHashMap maintains:', options: ['Sorted order', 'Insertion order (doubly linked list of entries)', 'Random order', 'Reverse order'], correctAnswer: 1,
        explanation: 'LinkedHashMap adds a doubly linked list alongside the HashMap to preserve insertion (or access) order.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['TreeMap'],
        question: 'TreeMap in Java maintains keys in:', options: ['Insertion order', 'Sorted (natural or custom) order via Red-Black Tree', 'Hash order', 'Random order'], correctAnswer: 1,
        explanation: 'TreeMap uses a Red-Black Tree; keys are sorted → O(log n) operations but ordered iteration.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['HashMap', 'worst-case'],
        question: 'HashMap worst-case get() before Java 8 tree conversion was:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2,
        explanation: 'Before Java 8, chaining used only LinkedList; all keys hashing to same bucket → O(n) lookup in worst case.'
    },
    {
        moduleOrder: 11, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['concurrentHashMap'],
        question: 'ConcurrentHashMap achieves thread safety by:', options: ['Locking entire map', 'Segment-level locking (or CAS in Java 8+)', 'Using volatile only', 'Immutable entries'], correctAnswer: 1,
        explanation: 'ConcurrentHashMap uses finer-grained locks (segments, or CAS + bin-level locking in Java 8+) for concurrent access.'
    },

    // Topic 11.3 – Advanced Hashing (Rabin-Karp)
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['Rabin-Karp', 'rolling-hash'],
        question: 'Rabin-Karp algorithm uses ___ to efficiently compute hash of sliding window:', options: ['Full rehash each step', 'Rolling hash (add new char, remove old char)', 'Binary search', 'Stack'], correctAnswer: 1,
        explanation: 'Rolling hash updates in O(1) per slide: subtract contribution of removed character, add new character.'
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['Rabin-Karp', 'false-positive'],
        question: 'A spurious hit in Rabin-Karp occurs when:', options: ['Pattern found', 'Hash matches but characters don\'t (collision)', 'Hash doesn\'t match', 'Pattern is empty'], correctAnswer: 1,
        explanation: 'False positive: same hash value but different strings. Verify character-by-character on hash match.' 
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['Rabin-Karp', 'complexity'],
        question: 'Rabin-Karp average complexity for pattern length m, text length n:', options: ['O(n×m)', 'O(n+m)', 'O(n log m)', 'O(m²)'], correctAnswer: 1,
        explanation: 'O(n) for rolling hash scan + O(m) for verification of true matches → O(n+m) average.' 
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['polynomial-hash'],
        question: 'Polynomial rolling hash: hash = Σ s[i] × base^(m-1-i) mod p. Modulo is used to:', options: ['Speed up multiplication', 'Prevent overflow and keep hash in range', 'Sort the hash', 'Ensure uniqueness'], correctAnswer: 1,
        explanation: 'Large polynomial values overflow; modulo keeps the hash within a manageable range.' 
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['multiple-pattern', 'Rabin-Karp'],
        question: 'Rabin-Karp advantage over KMP when searching for ___ patterns simultaneously:', options: ['1', 'Many patterns using a set of hashes (multi-pattern search)', 'Sorted patterns', 'Short patterns only'], correctAnswer: 1,
        explanation: 'With a HashSet of pattern hashes, Rabin-Karp checks all patterns in one pass – O(n + m × k) vs O(n × k).'
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['Rabin-Karp', 'worst-case'],
        question: 'Rabin-Karp worst-case (many spurious hits) complexity is:', options: ['O(n)', 'O(n×m)', 'O(n+m)', 'O(m²)'], correctAnswer: 1,
        explanation: 'If every window produces a hash collision requiring O(m) verification, worst case degrades to O(n×m).' 
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['double-hashing'],
        question: 'Using two independent hash functions in Rabin-Karp reduces:', options: ['Time complexity', 'Probability of false positives (collision probability ≈ 1/p₁p₂)', 'Space usage', 'Code length'], correctAnswer: 1,
        explanation: 'Two hashes must both collide for a false positive; probability drops to ~1/(p1×p2).'
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['longest-duplicate-substring'],
        question: 'Longest duplicate substring can be found with binary search + Rabin-Karp in:', options: ['O(n²)', 'O(n log² n)', 'O(n)', 'O(n log n)'], correctAnswer: 3,
        explanation: 'Binary search on length (O(log n)) × Rabin-Karp check per length (O(n)) = O(n log n) expected.'
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['hash-base-choice'],
        question: 'Good choice of base and modulus in polynomial hashing avoids:', options: ['Stack overflow', 'Hash clustering and overflow', 'Array out-of-bounds', 'Thread contention'], correctAnswer: 1,
        explanation: 'Large prime modulus reduces collision rate; base should be prime and larger than character set to minimise clustering.'
    },
    {
        moduleOrder: 11, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['2D-rolling-hash'],
        question: '2D Rabin-Karp for 2D pattern matching applies rolling hash:', options: ['Only column-wise', 'Row-wise then column-wise', 'Random direction', 'BFS order'], correctAnswer: 1,
        explanation: 'Hash each row\'s window, then hash the column of row-hashes; two-phase approach extends 1D to 2D.'
    },

    // -------------------- MODULE 12 – GRAPHS --------------------

    // Topic 12.1 – Graph Representation
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['adjacency-list'],
        question: 'Adjacency list representation space complexity for V vertices and E edges:', options: ['O(V²)', 'O(V+E)', 'O(E²)', 'O(V×E)'], correctAnswer: 1,
        explanation: 'Each vertex stores a list of its neighbours; total entries = V (vertex list) + E (edges) = O(V+E).'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['adjacency-matrix'],
        question: 'Adjacency matrix representation space complexity:', options: ['O(V+E)', 'O(V²)', 'O(E)', 'O(V log V)'], correctAnswer: 1,
        explanation: 'A V×V matrix stores 0/1 for each pair of vertices → O(V²) space regardless of edge count.'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['adjacency-matrix', 'edge-check'],
        question: 'Checking if edge (u, v) exists is O(1) using:', options: ['Adjacency list', 'Adjacency matrix [u][v]', 'Edge list', 'BFS'], correctAnswer: 1,
        explanation: 'Matrix[u][v] = 1 if edge exists → O(1) lookup. Adjacency list requires O(degree(u)) scan.' 
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['directed-undirected'],
        question: 'Undirected graph edge (u,v) is stored in adjacency list as:', options: ['Only u→v', 'Both u→v and v→u', 'Neither', 'Only in matrix'], correctAnswer: 1,
        explanation: 'Undirected edges appear in both u\'s and v\'s adjacency lists (bidirectional representation).' 
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['weighted-graph'],
        question: 'Weighted graph adjacency list stores pairs of:', options: ['(vertex, vertex)', '(neighbour, weight)', '(edge, colour)', '(weight, depth)'], correctAnswer: 1,
        explanation: 'Each entry in the adjacency list is a pair (neighbourVertex, edgeWeight) for weighted graphs.'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['sparse-dense'],
        question: 'For sparse graphs (E << V²), preferred representation is:', options: ['Adjacency matrix', 'Adjacency list', 'Edge matrix', 'Incidence matrix'], correctAnswer: 1,
        explanation: 'Adjacency list uses O(V+E) space; for sparse graphs, E is small so this is much better than O(V²) matrix.'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['degree'],
        question: 'In-degree of a vertex in a directed graph = number of:', options: ['Outgoing edges', 'Incoming edges', 'Total edges', 'Self-loops'], correctAnswer: 1,
        explanation: 'In-degree counts edges coming into the vertex; out-degree counts edges going out.'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['edge-list'],
        question: 'Edge list representation stores:', options: ['Only vertices', 'All edges as (u, v) pairs', 'Adjacency for each vertex', 'Matrix of distances'], correctAnswer: 1,
        explanation: 'Edge list is simply a list of all (u,v) edge pairs; simple but O(E) for edge lookup.'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['transpose-graph'],
        question: 'Transpose of a directed graph reverses:', options: ['Vertex order', 'All edge directions', 'Node values', 'Weights'], correctAnswer: 1,
        explanation: 'Transposed graph G^T has edge (v,u) for every edge (u,v) in G; useful for Kosaraju\'s SCC algorithm.'
    },
    {
        moduleOrder: 12, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['implicit-graph'],
        question: 'An implicit graph (e.g. word ladder) is represented by:', options: ['Explicit adjacency list', 'Generating neighbours on-the-fly during traversal', 'Matrix', 'Edge list'], correctAnswer: 1,
        explanation: 'Implicit graphs define neighbours procedurally; BFS/DFS generates edges as needed without storing all V+E upfront.'
    },

    // Topic 12.2 – BFS & DFS
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['BFS', 'level-order'],
        question: 'BFS explores nodes:', options: ['Deepest first', 'Level by level (nearest nodes first)', 'Randomly', 'Sorted order'], correctAnswer: 1,
        explanation: 'BFS visits all nodes at distance k before any node at distance k+1.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['DFS', 'recursion'],
        question: 'DFS explores nodes:', options: ['Level by level', 'As deep as possible before backtracking', 'Sorted order', 'Randomly'], correctAnswer: 1,
        explanation: 'DFS goes as deep as possible along each branch before backtracking to explore other branches.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['BFS', 'visited'],
        question: 'Visited array in BFS/DFS prevents:', options: ['Duplicate edges', 'Infinite loops from revisiting nodes', 'Sorting', 'Path tracking'], correctAnswer: 1,
        explanation: 'Without visited marking, BFS/DFS can revisit nodes infinitely in cyclic graphs.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['BFS', 'shortest-path'],
        question: 'BFS gives shortest path (fewest edges) in:', options: ['Weighted graphs', 'Unweighted graphs', 'DAGs only', 'Trees only'], correctAnswer: 1,
        explanation: 'BFS guarantees shortest path by edge count in unweighted graphs; not optimal for weighted graphs.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['DFS', 'cycle-detection'],
        question: 'Cycle detection in directed graph using DFS uses:', options: ['visited[] only', 'visited[] + recursionStack[]', 'BFS', 'Topological sort'], correctAnswer: 1,
        explanation: 'Track recursion stack; if we reach a node already in the recursion stack, a cycle exists.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['topological-sort', 'DFS'],
        question: 'Topological sort using DFS: nodes are added to result:', options: ['When first visited', 'When fully processed (all neighbours visited) – post-order', 'In BFS order', 'Alphabetically'], correctAnswer: 1,
        explanation: 'DFS topological sort adds nodes to the stack (result) after all their descendants are processed → post-order.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['connected-components'],
        question: 'Number of connected components found by running BFS/DFS until all nodes visited:', options: ['Count of nodes', 'Number of times we start a new BFS/DFS from an unvisited node', 'Number of edges', '1 always'], correctAnswer: 1,
        explanation: 'Each unvisited node starting a new BFS/DFS represents a new component; count those starts.' 
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['bipartite', 'BFS'],
        question: 'Checking bipartiteness using BFS:', options: ['Sort nodes', 'Colour nodes with 2 colours; edge connects same colour → not bipartite', 'DFS required', 'Count edges'], correctAnswer: 1,
        explanation: '2-colour BFS: assign alternating colours; if two adjacent nodes share a colour, the graph is not bipartite.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['BFS', '0-1-BFS'],
        question: '0-1 BFS (edges with weight 0 or 1) uses a ___ instead of a regular queue:', options: ['Stack', 'Priority queue', 'Deque (front for 0-weight, back for 1-weight)', 'Two queues'], correctAnswer: 2,
        explanation: '0-1 BFS uses a deque: 0-weight edges push to front (higher priority), 1-weight to back → O(V+E) like BFS.'
    },
    {
        moduleOrder: 12, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['SCC', 'Kosaraju'],
        question: 'Kosaraju\'s algorithm finds SCCs in:', options: ['O(V log V)', 'O(V+E) with two DFS passes', 'O(E log V)', 'O(V²)'], correctAnswer: 1,
        explanation: 'Pass 1: DFS on original graph, push to stack. Pass 2: DFS on transposed graph in stack order → SCCs in O(V+E).'
    },

    // Topic 12.3 – Shortest Path (Dijkstra)
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ["Dijkstra", 'requirement'],
        question: "Dijkstra's algorithm requires:", options: ['Unweighted graph', 'Non-negative edge weights', 'Directed graph only', 'Sorted edges'], correctAnswer: 1,
        explanation: "Dijkstra's fails with negative weights because greedy relaxation can be invalidated by negative edges."
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ["Dijkstra", 'data-structure'],
        question: "Dijkstra's uses ___ for efficient minimum distance extraction:", options: ['Stack', 'Queue', 'Priority queue (min-heap)', 'Array'], correctAnswer: 2,
        explanation: "Min-heap extracts the unvisited node with minimum distance in O(log V) → efficient for sparse graphs."
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ["Dijkstra", 'relaxation'],
        question: 'Edge relaxation in Dijkstra: if dist[u] + weight(u,v) < dist[v], then:', options: ['Ignore', 'Update dist[v] and re-add to priority queue', 'Delete v', 'Add new edge'], correctAnswer: 1,
        explanation: 'Relaxation: update dist[v] to the shorter path via u, then push (dist[v], v) into the priority queue.' 
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ["Dijkstra", 'complexity'],
        question: "Dijkstra's with binary heap complexity:", options: ['O(V²)', 'O((V+E) log V)', 'O(E log E)', 'O(V log V)'], correctAnswer: 1,
        explanation: 'Each vertex and edge is processed once; heap operations cost O(log V) → O((V+E) log V) total.'
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['Bellman-Ford', 'negative'],
        question: 'For graphs with negative weights, use ___ instead of Dijkstra:', options: ["Dijkstra's with absolute values", "Bellman-Ford (O(VE)) or SPFA", "BFS", "DFS"], correctAnswer: 1,
        explanation: "Bellman-Ford relaxes all edges V-1 times, handling negative weights correctly. O(VE) time."
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['Floyd-Warshall'],
        question: 'Floyd-Warshall finds all-pairs shortest paths in:', options: ['O(V+E)', 'O(V²)', 'O(V³)', 'O(V log V)'], correctAnswer: 2,
        explanation: 'Three nested loops over all vertices → O(V³). Works with negative weights (no negative cycles).'
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ["Dijkstra", 'greedy'],
        question: "Why Dijkstra's is greedy:", options: ['It sorts edges', 'It always processes the unvisited node with minimum current distance', 'It uses DP', 'It backtracks'], correctAnswer: 1,
        explanation: "Greedy choice: the node with the smallest tentative distance is confirmed optimal at each step (no negative edges guarantee this)."
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['SSSP', 'DAG'],
        question: 'Single-source shortest path on DAG (no cycles) can be done in:', options: ['O(V²)', 'O(V+E) using topological sort + relaxation', 'O(E log V)', 'O(VE)'], correctAnswer: 1,
        explanation: 'Process vertices in topological order; relax each edge once → O(V+E). Works with negative edges.'
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ["Dijkstra", 'bidirectional'],
        question: 'Bidirectional Dijkstra reduces practical search space by approximately:', options: ['2×', 'Half', 'Square root of original', 'Log factor'], correctAnswer: 1,
        explanation: 'Running Dijkstra from both source and target and meeting in the middle halves the explored nodes roughly.' 
    },
    {
        moduleOrder: 12, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['Johnson-algorithm'],
        question: 'Johnson\'s algorithm solves all-pairs shortest paths on sparse graphs in:', options: ['O(V³)', 'O(V² log V + VE)', 'O(VE)', 'O(E log V)'], correctAnswer: 1,
        explanation: 'Johnson\'s: Bellman-Ford for reweighting O(VE) + Dijkstra from each vertex O(V×(V+E)log V) → efficient for sparse graphs.' 
    },

    // -------------------- MODULE 13 – DYNAMIC PROGRAMMING --------------------

    // Topic 13.1 – DP Fundamentals
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['DP', 'overlapping-subproblems'],
        question: 'DP is applicable when a problem has:', options: ['Greedy structure only', 'Overlapping subproblems and optimal substructure', 'No recursion', 'Sorted input'], correctAnswer: 1,
        explanation: 'DP stores solutions to overlapping subproblems (memoisation/tabulation) to avoid recomputation.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['memoization', 'top-down'],
        question: 'Top-down DP (memoisation) is:', options: ['Iterative table filling', 'Recursive with caching of results', 'Greedy selection', 'BFS on states'], correctAnswer: 1,
        explanation: 'Memoisation: recursive solution that stores computed results in a hash map or array to avoid redundant calls.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['tabulation', 'bottom-up'],
        question: 'Bottom-up DP (tabulation):', options: ['Uses recursion', 'Fills a table iteratively from base cases', 'Uses random order', 'Requires sorting'], correctAnswer: 1,
        explanation: 'Tabulation fills a DP table starting from the simplest base cases, building up to the full problem.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['fibonacci', 'DP'],
        question: 'Fibonacci DP (tabulation) space complexity:', options: ['O(n)', 'O(1) (optimised with two variables)', 'O(n²)', 'O(log n)'], correctAnswer: 1,
        explanation: 'Only the last two Fibonacci values are needed at any point → O(1) space optimisation.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['coin-change', 'DP'],
        question: 'Coin Change (minimum coins) DP has time complexity (n coins, amount A):', options: ['O(n)', 'O(n×A)', 'O(A²)', 'O(n²)'], correctAnswer: 1,
        explanation: 'dp[a] = min(dp[a-coin]+1) for each coin and each amount 0..A → O(n×A) time.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['optimal-substructure'],
        question: 'Optimal substructure means:', options: ['Random subproblem order', 'Optimal solution contains optimal solutions to subproblems', 'Greedy always works', 'BFS gives optimal'], correctAnswer: 1,
        explanation: 'A problem has optimal substructure if its optimal solution is composed of optimal solutions to sub-instances.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['state-definition'],
        question: 'Most important step in DP problem solving:', options: ['Choosing base case first', 'Defining the state clearly (what dp[i] represents)', 'Selecting the algorithm', 'Sorting data'], correctAnswer: 1,
        explanation: 'Clear state definition – what dp[i] or dp[i][j] means – determines the transition relation and solution correctness.'
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['longest-increasing-subsequence'],
        question: 'Longest Increasing Subsequence basic DP is:', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)'], correctAnswer: 2,
        explanation: 'dp[i] = max(dp[j]+1) for all j < i with arr[j] < arr[i] → O(n²). Patience sort achieves O(n log n).' 
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['DP', 'state-compression'],
        question: 'Bitmask DP is used when:', options: ['Array is large', 'Number of items is small (≤20) and states can be encoded as bitmasks', 'Problem has no overlapping subproblems', 'Input is sorted'], correctAnswer: 1,
        explanation: 'Bitmask DP encodes subsets as bits; feasible for n≤20 since 2²⁰ ≈ 1M states.' 
    },
    {
        moduleOrder: 13, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['DP', 'convex-hull-trick'],
        question: 'Convex Hull Trick optimises DP transitions of the form dp[i] = min over j of (f(j) + g(i)×h(j)) to:', options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(n²/2)'], correctAnswer: 1,
        explanation: 'Convex Hull Trick (monotone hull) reduces O(n²) linear DP to O(n) by maintaining a convex hull of lines.' 
    },

    // Topic 13.2 – Knapsack & Subset DP
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['0-1-knapsack'],
        question: '0/1 Knapsack differs from fractional knapsack because:', options: ['You can take fractions', 'You take or skip items (no fractions)', 'It uses greedy', 'Items are sorted'], correctAnswer: 1,
        explanation: '0/1 Knapsack: each item is taken wholly or not at all → requires DP, not greedy.'
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['0-1-knapsack', 'complexity'],
        question: '0/1 Knapsack time complexity (n items, capacity W):', options: ['O(n)', 'O(n×W)', 'O(2ⁿ)', 'O(W²)'], correctAnswer: 1,
        explanation: 'dp[i][w] = max(dp[i-1][w], dp[i-1][w-wi]+vi) → n×W states each O(1) → O(n×W).'
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['subset-sum'],
        question: 'Subset Sum problem (can we reach target T from array elements?):', options: ['O(n)', 'O(n×T)', 'O(n log n)', 'O(T²)'], correctAnswer: 1,
        explanation: 'dp[i][s] = can we form sum s using first i elements → O(n×T) DP table.'
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['unbounded-knapsack'],
        question: 'Unbounded Knapsack allows:', options: ['Each item once', 'Each item unlimited times', 'Only 2 copies of each item', 'No repetition'], correctAnswer: 1,
        explanation: 'Unbounded Knapsack: items can be reused; transition: dp[w] = max(dp[w], dp[w-wi]+vi).'
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['partition-equal-subset'],
        question: 'Partition Equal Subset Sum reduces to:', options: ['Sorting problem', 'Subset Sum with target = totalSum/2', 'Knapsack variant', 'Longest Increasing Subsequence'], correctAnswer: 1,
        explanation: 'If total sum is even, check if subset summing to total/2 exists using 0/1 Knapsack approach.' 
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['space-optimized-knapsack'],
        question: 'Space-optimised 0/1 Knapsack uses a ___ array with iteration:', options: ['2D array forward', '1D array iterated backwards (to avoid using item twice)', 'Random direction', 'Stack'], correctAnswer: 1,
        explanation: 'Iterating capacity backwards ensures each item is counted at most once in the 1D DP array.' 
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['count-subsets'],
        question: 'Count subsets with given sum uses:', options: ['Boolean DP', 'Count DP (add counts instead of boolean)', 'Greedy', 'Sorting'], correctAnswer: 1,
        explanation: 'Instead of dp[s] = boolean, use dp[s] = count of ways to reach sum s; transition: dp[s] += dp[s - num].' 
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['target-sum', 'DP'],
        question: 'Target Sum (assign + or - to array elements) reduces to:', options: ['Simple sum', 'Subset Sum variant: find subset with sum = (total+target)/2', 'Sorting then binary search', 'Two-pointer'], correctAnswer: 1,
        explanation: '+ subset sum - remaining = target → sum of + subset = (total + target) / 2; count subsets with that sum.' 
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['rod-cutting'],
        question: 'Rod Cutting problem (cut rod for max price) is identical to:', options: ['0/1 Knapsack', 'Unbounded Knapsack (pieces reusable)', 'Coin Change', 'Matrix Chain Multiplication'], correctAnswer: 1,
        explanation: 'Rod pieces can be reused (different lengths from same rod) → Unbounded Knapsack formulation.'
    },
    {
        moduleOrder: 13, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['min-cost-partition'],
        question: 'Optimal BST construction and Matrix Chain Multiplication belong to the ___ DP category:', options: ['Linear DP', 'Interval DP (dp on subranges [i,j])', 'Bitmask DP', 'Tree DP'], correctAnswer: 1,
        explanation: 'Interval DP: dp[i][j] = optimal cost for subrange [i,j]; merge optimal subranges with a split point k.'
    },

    // Topic 13.3 – DP on Strings & Grid
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['LCS'],
        question: 'LCS (Longest Common Subsequence) of "ABCBDAB" and "BDCABA" length is:', options: ['3', '4', '5', '6'], correctAnswer: 1,
        explanation: 'LCS = "BCBA" or "BDAB" with length 4 – computed by the classic 2D DP table.' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['LCS', 'complexity'],
        question: 'LCS time and space complexity for strings of length m and n:', options: ['O(m+n)', 'O(m×n)', 'O(m²×n²)', 'O(2^(m+n))'], correctAnswer: 1,
        explanation: 'dp[i][j] for all i∈[0,m], j∈[0,n] → O(m×n) time and space.'
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['edit-distance'],
        question: 'Edit Distance (Levenshtein) allows operations:', options: ['Insert only', 'Insert, delete, and substitute', 'Substitute only', 'Insert and delete'], correctAnswer: 1,
        explanation: 'Edit distance = minimum inserts, deletes, or substitutions to transform one string to another.' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['grid-DP', 'unique-paths'],
        question: 'Unique Paths in m×n grid (move right or down only) = :', options: ['m+n', 'm×n', 'C(m+n-2, m-1)', 'm^n'], correctAnswer: 2,
        explanation: 'Choose m-1 down moves among m+n-2 total moves: C(m+n-2, m-1) distinct paths.' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['LPS'],
        question: 'Longest Palindromic Subsequence = ?', options: ['Length of string', 'LCS(s, reverse(s))', 'Brute force 2^n', 'Length/2'], correctAnswer: 1,
        explanation: 'LPS = LCS of the string and its reverse; a classic string DP reduction.' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['edit-distance', 'DP'],
        question: 'Edit Distance base cases: dp[i][0] = i and dp[0][j] = j represent:', options: ['Diagonal values', 'Transforming i characters to/from empty string (all inserts/deletes)', 'Maximum lengths', 'Zero costs'], correctAnswer: 1,
        explanation: 'dp[i][0] = i deletions to empty string; dp[0][j] = j insertions from empty string.' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['min-path-sum', 'grid'],
        question: 'Minimum path sum in grid (move right/down) DP transition:', options: ['dp[i][j] = grid[i][j] + max(dp[i-1][j], dp[i][j-1])', 'dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])', 'dp[i][j] = dp[i-1][j-1]', 'dp[i][j] = 0'], correctAnswer: 1,
        explanation: 'Minimum path = current cell cost + minimum of coming from top or left.' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['palindrome-partition'],
        question: 'Palindrome Partitioning II (min cuts) DP runs in:', options: ['O(n³)', 'O(n²)', 'O(n)', 'O(2^n)'], correctAnswer: 1,
        explanation: 'Precompute palindrome[i][j] in O(n²), then dp[i] = min cuts for s[0..i] in O(n²) total.'
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['interleaving-strings'],
        question: 'Interleaving Strings (is C an interleaving of A and B?): dp[i][j] means:', options: ['i+j characters matched', 'First i chars of A and j chars of B form interleaving of C[0..i+j-1]', 'Cost of merging', 'LCS length'], correctAnswer: 1,
        explanation: 'dp[i][j] = can we form C[0..i+j-1] as an interleaving of A[0..i-1] and B[0..j-1].' 
    },
    {
        moduleOrder: 13, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['distinct-subsequences'],
        question: 'Count Distinct Subsequences of string S in T uses:', options: ['O(n)', 'O(|S|×|T|) DP', 'O(2^n)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'dp[i][j] = number of ways to form T[0..j-1] in S[0..i-1]; transitions on character match/mismatch.' 
    },

    // -------------------- MODULE 14 – ADVANCED DSA --------------------

    // Topic 14.1 – Tries (Prefix Trees)
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Basic', questionType: 'conceptual', tags: ['trie', 'structure'],
        question: 'A Trie (prefix tree) node contains:', options: ['Value and parent', 'Array/Map of children (one per character) and isEndOfWord flag', 'Only character', 'Height and depth'], correctAnswer: 1,
        explanation: 'Each Trie node has children pointers (26 for lowercase alpha or a HashMap) and an end-of-word marker.'
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['trie', 'insert'],
        question: 'Inserting a word of length L into a Trie:', options: ['O(1)', 'O(L)', 'O(n)', 'O(L log n)'], correctAnswer: 1,
        explanation: 'Traverse L characters, creating nodes as needed → O(L) time and space.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['trie', 'search'],
        question: 'Searching for a word of length L in a Trie:', options: ['O(n)', 'O(L)', 'O(log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'Follow characters of the word down the Trie → O(L) time, independent of total words stored.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Basic', questionType: 'application', tags: ['trie', 'prefix-match'],
        question: 'startsWith(prefix) in Trie checks:', options: ['Word exists exactly', 'All words starting with prefix by traversing prefix path', 'Sorted words', 'Character frequency'], correctAnswer: 1,
        explanation: 'Traverse the prefix characters; if all nodes exist, the prefix is present → O(|prefix|) time.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['trie', 'autocomplete'],
        question: 'Autocomplete using Trie: after finding prefix node, do ___ to list all completions:', options: ['BFS from prefix node', 'DFS from prefix node collecting all leaf paths', 'Sort children', 'Binary search'], correctAnswer: 1,
        explanation: 'DFS from the prefix node visits all paths (words) extending the prefix, collecting them in a list.'
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['trie', 'vs-HashMap'],
        question: 'Trie advantage over HashMap for prefix operations:', options: ['Faster single lookup', 'O(L) prefix queries and prefix enumeration; HashMap cannot enumerate prefix matches easily', 'Less memory', 'Random access'], correctAnswer: 1,
        explanation: 'Trie natively supports prefix queries and enumeration; HashMap can only check exact keys.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Medium', questionType: 'reasoning', tags: ['compressed-trie', 'Patricia'],
        question: 'Compressed Trie (Patricia Trie) reduces space by:', options: ['Using arrays', 'Merging nodes with single children into one edge with a string label', 'Sorting words', 'Using bit arrays'], correctAnswer: 1,
        explanation: 'Compressed Trie merges chains of single-child nodes into single edges with multi-character labels, reducing node count.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Medium', questionType: 'application', tags: ['XOR-trie', 'maximum-XOR'],
        question: 'Maximum XOR of two numbers in an array uses a ___ bit-level Trie:', options: ['Suffix Trie', 'Bit Trie (binary Trie over bit representations)', 'Compressed Trie', 'Hash Trie'], correctAnswer: 1,
        explanation: 'Binary Trie stores numbers bit by bit (MSB first); for each number, greedily pick the opposite bit to maximise XOR.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['trie', 'space-complexity'],
        question: 'Space complexity of Trie with n words of average length L:', options: ['O(n)', 'O(n×L)', 'O(L)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Worst case: no shared prefixes → n×L nodes. Best case with shared prefixes: much less.' 
    },
    {
        moduleOrder: 14, topicOrder: 1, difficulty: 'Hard', questionType: 'reasoning', tags: ['suffix-trie'],
        question: 'Suffix Trie of string length n has ___ suffixes (leaves):', options: ['n/2', 'n', '2n', 'n²'], correctAnswer: 1,
        explanation: 'A string of length n has exactly n suffixes (from index 0, 1, ..., n-1), each a leaf in the suffix trie.'
    },

    // Topic 14.2 – Greedy Algorithms
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['greedy', 'principle'],
        question: 'Greedy algorithm makes the ___ choice at each step:', options: ['Random', 'Locally optimal (best immediate option)', 'Globally optimal', 'Smallest value'], correctAnswer: 1,
        explanation: 'Greedy: at each step, pick the option that seems best locally, hoping it leads to a globally optimal solution.' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['activity-selection'],
        question: 'Activity Selection Problem greedy strategy: always pick:', options: ['Activity with earliest start', 'Activity with longest duration', 'Activity with earliest finish time', 'Activity with most conflicts'], correctAnswer: 2,
        explanation: 'Earliest finish first maximises non-overlapping activities: classic greedy proof by exchange argument.'
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Basic', questionType: 'application', tags: ['fractional-knapsack'],
        question: 'Fractional Knapsack greedy strategy: sort by:', options: ['Weight ascending', 'Value ascending', 'Value/Weight ratio descending', 'Weight descending'], correctAnswer: 2,
        explanation: 'Take items with highest value-to-weight ratio first; fractions allowed → greedy is optimal.' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Basic', questionType: 'conceptual', tags: ['greedy', 'when-works'],
        question: 'Greedy approach is provably correct when the problem has:', options: ['Overlapping subproblems', 'Greedy choice property and optimal substructure', 'Only two choices', 'Sorted input'], correctAnswer: 1,
        explanation: 'Greedy works when a locally optimal choice is safe (greedy choice property) and optimal substructure holds.' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['interval-scheduling'],
        question: 'Minimum platforms required for trains (interval scheduling) uses:', options: ['Greedy with sorting start/end times + two-pointer or max overlap count', 'DP', 'BFS', 'Divide and conquer'], correctAnswer: 0,
        explanation: 'Sort start and end times; use two pointers to count maximum simultaneous arrivals (overlapping intervals).'
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['Huffman-coding'],
        question: 'Huffman Coding uses greedy by always merging the ___ frequency symbols:', options: ['Highest', 'Two lowest frequency symbols', 'Random', 'Equal'], correctAnswer: 1,
        explanation: 'Merging the two lowest-frequency nodes minimises the total weighted path length → optimal prefix code.' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Medium', questionType: 'application', tags: ['jump-game'],
        question: 'Jump Game II (minimum jumps to reach end) greedy tracks:', options: ['Exact jump positions', 'Farthest reachable position at each step', 'Random jumps', 'BFS levels'], correctAnswer: 1,
        explanation: 'Track current range end and farthest reachable; when current range ends, increment jumps and extend range.' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Medium', questionType: 'reasoning', tags: ['greedy', 'proof'],
        question: 'Exchange argument in greedy proofs shows:', options: ['Brute force correctness', 'Swapping any non-greedy choice with the greedy choice does not worsen the solution', 'Greedy is always wrong', 'DP is equivalent'], correctAnswer: 1,
        explanation: 'Exchange argument: assume an optimal solution differs from greedy; show swapping to match greedy doesn\'t hurt → greedy is also optimal.' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['task-scheduling', 'greedy'],
        question: 'Task Scheduler (CPU with cooldown n) greedy: arrange most frequent tasks first. Time complexity:', options: ['O(n)', 'O(n log k) where k is unique tasks', 'O(n²)', 'O(1)'], correctAnswer: 1,
        explanation: 'Use max-heap of task frequencies; each cycle processes top tasks and cools down → O(n log k).' 
    },
    {
        moduleOrder: 14, topicOrder: 2, difficulty: 'Hard', questionType: 'reasoning', tags: ['Prim-Kruskal'],
        question: 'Kruskal\'s MST algorithm is greedy because it:', options: ['Uses BFS', 'Always adds the minimum weight edge that doesn\'t form a cycle', 'Processes vertices greedily', 'Uses DFS'], correctAnswer: 1,
        explanation: 'Kruskal\'s sorts edges by weight; greedily adds minimum edge if it doesn\'t create a cycle (checked by Union-Find).' 
    },

    // Topic 14.3 – Segment Trees
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['segment-tree', 'range-query'],
        question: 'Segment Tree enables range queries in:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Segment tree stores precomputed range values; query traverses O(log n) nodes.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Basic', questionType: 'conceptual', tags: ['segment-tree', 'build'],
        question: 'Building a segment tree on n elements takes:', options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 1,
        explanation: 'Build is O(n): visit each internal node once. The tree has 2n-1 nodes.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['segment-tree', 'point-update'],
        question: 'Point update in segment tree takes:', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Update a leaf and propagate changes up: O(height) = O(log n) node updates.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Basic', questionType: 'application', tags: ['segment-tree', 'array-size'],
        question: 'Segment tree for n elements requires array of size approximately:', options: ['n', '2n', '4n', 'n log n'], correctAnswer: 2,
        explanation: 'A segment tree array is allocated as 4×n to accommodate all nodes, including the last level padding.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['lazy-propagation'],
        question: 'Lazy propagation in segment trees defers:', options: ['Build time', 'Range updates to query time, reducing range update from O(n) to O(log n)', 'Point queries', 'Memory allocation'], correctAnswer: 1,
        explanation: 'Lazy tags mark subtrees for pending updates; applied on-demand during query/update traversal → O(log n) per operation.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['segment-tree', 'range-update'],
        question: 'Without lazy propagation, range update on segment tree is:', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'], correctAnswer: 1,
        explanation: 'Updating all n elements in the range one by one is O(n) without laziness.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Medium', questionType: 'application', tags: ['merge-sort-tree'],
        question: 'Merge Sort Tree (segment tree with sorted lists at nodes) enables count queries in range in:', options: ['O(log n)', 'O(log² n)', 'O(n)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Query each of O(log n) nodes using binary search (O(log n) each) → O(log² n) per query.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Medium', questionType: 'reasoning', tags: ['segment-tree', 'vs-BIT'],
        question: 'Segment Tree vs Binary Indexed Tree (Fenwick): Segment Tree supports:', options: ['Only prefix sums', 'Any associative range query (min, max, GCD, etc.)', 'Only point updates', 'Only sorted arrays'], correctAnswer: 1,
        explanation: 'BIT supports prefix sums and range updates easily; Segment Tree supports any associative operation (min, max, XOR, etc.).'
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['persistent-segment-tree'],
        question: 'Persistent Segment Tree creates a new version per update in:', options: ['O(n)', 'O(log n) time and space per update', 'O(1)', 'O(n log n)'], correctAnswer: 1,
        explanation: 'Only O(log n) nodes differ per version; copy only the path from root to modified leaf → O(log n) per update.' 
    },
    {
        moduleOrder: 14, topicOrder: 3, difficulty: 'Hard', questionType: 'reasoning', tags: ['2D-segment-tree'],
        question: '2D Segment Tree for m×n grid range queries has build complexity:', options: ['O(m×n)', 'O(m×n log(m×n))', 'O(m×n×log m×log n)', 'O(m²×n²)'], correctAnswer: 2,
        explanation: 'Outer segment tree has O(m log m) nodes; each has an inner tree of O(n log n) → O(mn log m log n).' 
    },

    // Topic 14.4 – Mo's Algorithm
    {
        moduleOrder: 14, topicOrder: 4, difficulty: 'Medium', questionType: 'reasoning', tags: ["Mo's", 'vs-sqrt-decomp'],
        question: "Mo's algorithm is a generalisation of which technique?",
        options: ['Merge sort', 'Square root decomposition for offline range queries', 'Binary indexed tree', 'Segment tree'],
        correctAnswer: 1,
        explanation: "Mo's organises queries into √n-sized blocks — a direct application of sqrt decomposition to offline query processing."
    },
    {
        moduleOrder: 14, topicOrder: 4, difficulty: 'Medium', questionType: 'application', tags: ["Mo's", 'add-remove'],
        question: "In Mo's algorithm, the 'add' and 'remove' operations update the current window. Their combined time per query is:",
        options: ['O(n)', 'O(1) per pointer move (O(√n) total moves per query on average)', 'O(log n)', 'O(n²)'],
        correctAnswer: 1,
        explanation: "Each add/remove is O(1) (e.g., increment frequency array). The block ordering ensures O(√n) total pointer moves per query on average."
    },
    {
        moduleOrder: 14, topicOrder: 4, difficulty: 'Medium', questionType: 'reasoning', tags: ["Mo's", 'Hilbert-curve'],
        question: "Mo's algorithm with Hilbert curve ordering improves practical performance by:",
        options: ['Reducing asymptotic complexity to O(n)', 'Reducing cache misses via better spatial locality of pointer movement', 'Sorting queries by answer', 'Using less memory'],
        correctAnswer: 1,
        explanation: "Hilbert curve ordering keeps pointer movement spatially local, reducing cache misses in practice though the asymptotic bound stays O((n+q)√n)."
    },
    {
        moduleOrder: 14, topicOrder: 4, difficulty: 'Hard', questionType: 'reasoning', tags: ["Mo's", 'with-updates'],
        question: "Mo's algorithm with updates (point updates between queries) has complexity:",
        options: ['O((n+q)√n)', 'O(n^(5/3)) using block size n^(2/3)', 'O(n log n)', 'O(q√n)'],
        correctAnswer: 1,
        explanation: "With updates, block size n^(2/3) balances query and update costs, giving O(n^(5/3)) total — a classic extension of Mo's."
    },
    {
        moduleOrder: 14, topicOrder: 4, difficulty: 'Hard', questionType: 'reasoning', tags: ["Mo's", 'suitable-problems'],
        question: "Mo's algorithm is NOT suitable for problems where:",
        options: ['Queries have large ranges', 'The answer function is not easily reversible (remove is hard to implement)', 'Array is large', 'Queries overlap'],
        correctAnswer: 1,
        explanation: "Mo's requires efficient add AND remove operations. When removing an element from the window is hard (e.g., max of range without segment tree), Mo's is impractical."
    },
]; // ← closes the mcqs array


// ============================================================================
//  CODING PROBLEMS  (1 per topic = 47 total)
//  hasCoding: false  → purely conceptual topic (no coding exercise)
//  hasCoding: true   → has javaStarterCode, testCases, hints
// ============================================================================
const codingProblems = [

    // -------------------- Module 1 – Fundamentals --------------------

    // 1.1 Flowcharts & Pseudocode  (conceptual – no coding)
    {
        moduleOrder: 1, topicOrder: 1,
        hasCoding: false,
        title: 'Flowchart Design Exercise',
        description: 'This topic is conceptual. Design a flowchart for finding the largest of three numbers.',
        difficulty: 'Basic', tags: ['flowchart', 'pseudocode'],
    },

    // 1.2 Java Architecture & Setup  (conceptual – no coding)
    {
        moduleOrder: 1, topicOrder: 2,
        hasCoding: false,
        title: 'JVM Architecture Understanding',
        description: 'This topic is conceptual. Understand the JVM, JDK, and JRE components.',
        difficulty: 'Basic', tags: ['JVM', 'JDK', 'JRE'],
    },

    // 1.3 First Java Program & Datatypes
    {
        moduleOrder: 1, topicOrder: 3,
        hasCoding: true,
        title: 'Datatype Overflow Checker',
        description: 'Write a Java program that reads an integer and determines if it is within the valid int range.',
        problemStatement: 'Given a long value N, print "Valid int" if it fits in a Java int, otherwise print "Overflow".',
        inputFormat: 'A single long integer N.',
        outputFormat: '"Valid int" or "Overflow".',
        constraints: ['-10^18 <= N <= 10^18'],
        sampleInput: '2147483647',
        sampleOutput: 'Valid int',
        solutionApproach: 'Compare N with Integer.MIN_VALUE and Integer.MAX_VALUE.',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['datatypes', 'int', 'overflow'],
        javaStarterCode: `import java.util.Scanner;

public class DatatypeOverflow {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        // TODO: Check if n is within int range
        // Integer.MIN_VALUE = -2147483648
        // Integer.MAX_VALUE =  2147483647
        // Print "Valid int" or "Overflow"
    }
}`,
        testCases: [
            { input: '2147483647', expectedOutput: 'Valid int', isHidden: false },
            { input: '2147483648', expectedOutput: 'Overflow', isHidden: false },
            { input: '-2147483648', expectedOutput: 'Valid int', isHidden: true },
            { input: '-2147483649', expectedOutput: 'Overflow', isHidden: true },
        ],
        hints: [
            'Use Integer.MIN_VALUE and Integer.MAX_VALUE constants.',
            'The input must be a long to hold values outside int range.',
        ],
    },

    // 1.4 Conditionals & Loops
    {
        moduleOrder: 1, topicOrder: 4,
        hasCoding: true,
        title: 'FizzBuzz',
        description: 'Classic conditionals and loops exercise from Kunal\'s video.',
        problemStatement: 'Print numbers 1 to N. For multiples of 3 print "Fizz", multiples of 5 print "Buzz", multiples of both print "FizzBuzz".',
        inputFormat: 'A single integer N.',
        outputFormat: 'N lines of output.',
        constraints: ['1 <= N <= 10000'],
        sampleInput: '15',
        sampleOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
        solutionApproach: 'Use a for loop 1..N with if-else checking divisibility by 15, then 3, then 5.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['conditionals', 'loops', 'modulo'],
        javaStarterCode: `import java.util.Scanner;

public class FizzBuzz {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        for (int i = 1; i <= n; i++) {
            // TODO: print FizzBuzz / Fizz / Buzz / i
            // Hint: check divisibility by 15 first, then 3, then 5
        }
    }
}`,
        testCases: [
            { input: '5', expectedOutput: '1\n2\nFizz\n4\nBuzz', isHidden: false },
            { input: '15', expectedOutput: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: true },
        ],
        hints: [
            'Check divisibility by 15 (both 3 and 5) first to avoid missing FizzBuzz.',
            'Use the modulo operator % to check divisibility.',
        ],
    },

    // 1.5 Functions & Methods
    {
        moduleOrder: 1, topicOrder: 5,
        hasCoding: true,
        title: 'Calculator with Methods',
        description: 'Implement a calculator using separate methods for each operation.',
        problemStatement: 'Given two integers A and B and an operator (+, -, *, /), return the result. For division, use integer division. If dividing by zero, print "Error".',
        inputFormat: 'First line: A and B (space-separated). Second line: operator character.',
        outputFormat: 'Result of the operation or "Error".',
        constraints: ['-10^9 <= A,B <= 10^9', 'Operator is one of +, -, *, /'],
        sampleInput: '10 3\n/',
        sampleOutput: '3',
        solutionApproach: 'Write separate static methods add(a,b), subtract(a,b), multiply(a,b), divide(a,b) and call the appropriate one.',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['methods', 'overloading', 'functions'],
        javaStarterCode: `import java.util.Scanner;

public class Calculator {

    static long add(long a, long b) {
        // TODO: return sum
        return 0;
    }

    static long subtract(long a, long b) {
        // TODO: return difference
        return 0;
    }

    static long multiply(long a, long b) {
        // TODO: return product
        return 0;
    }

    static String divide(long a, long b) {
        // TODO: return integer division result or "Error" if b == 0
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong();
        long b = sc.nextLong();
        char op = sc.next().charAt(0);
        // TODO: call correct method based on op and print result
    }
}`,
        testCases: [
            { input: '10 3\n/', expectedOutput: '3', isHidden: false },
            { input: '7 0\n/', expectedOutput: 'Error', isHidden: false },
            { input: '5 3\n+', expectedOutput: '8', isHidden: true },
            { input: '5 3\n*', expectedOutput: '15', isHidden: true },
        ],
        hints: [
            'Handle division by zero before performing division.',
            'Use a switch-case or if-else on the operator character.',
        ],
    },

    // 1.6 OOP  (conceptual-heavy – placeholder with basic exercise)
    {
        moduleOrder: 1, topicOrder: 6,
        hasCoding: true,
        title: 'BankAccount Class',
        description: 'Apply OOP concepts: encapsulation, constructors, and methods.',
        problemStatement: 'Create a BankAccount class with a private balance. Support deposit(amount) and withdraw(amount). If withdrawal exceeds balance, print "Insufficient funds". Read Q operations and print balance after all.',
        inputFormat: 'First line: initial balance. Next lines: D amount or W amount.',
        outputFormat: 'Final balance after all operations.',
        constraints: ['0 <= initial balance <= 10^9', '1 <= Q <= 100', '0 < amount <= 10^9'],
        sampleInput: '1000\nD 500\nW 200\nW 2000',
        sampleOutput: 'Insufficient funds\n1300',
        solutionApproach: 'Encapsulate balance as private field. deposit() adds, withdraw() checks then subtracts.',
        timeComplexity: 'O(Q)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['OOP', 'encapsulation', 'class', 'methods'],
        javaStarterCode: `import java.util.Scanner;

class BankAccount {
    private long balance;

    // TODO: Constructor to set initial balance
    BankAccount(long initialBalance) {
    }

    // TODO: deposit method
    void deposit(long amount) {
    }

    // TODO: withdraw method – print "Insufficient funds" if amount > balance
    void withdraw(long amount) {
    }

    long getBalance() {
        return balance;
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long init = sc.nextLong();
        BankAccount account = new BankAccount(init);
        while (sc.hasNext()) {
            char op = sc.next().charAt(0);
            long amt = sc.nextLong();
            // TODO: call deposit or withdraw
        }
        System.out.println(account.getBalance());
    }
}`,
        testCases: [
            { input: '1000\nD 500\nW 200\nW 2000', expectedOutput: 'Insufficient funds\n1300', isHidden: false },
            { input: '500\nW 500', expectedOutput: '0', isHidden: false },
            { input: '0\nD 100\nW 50', expectedOutput: '50', isHidden: true },
        ],
        hints: [
            'Make balance private and provide a getter.',
            'In withdraw(), compare amount with balance before subtracting.',
        ],
    },

    // 1.7 Time & Space Complexity  (conceptual – no coding)
    {
        moduleOrder: 1, topicOrder: 7,
        hasCoding: false,
        title: 'Complexity Analysis Exercise',
        description: 'This topic is conceptual. Analyse the time and space complexity of given code snippets.',
        difficulty: 'Medium', tags: ['Big-O', 'complexity'],
    },

    // -------------------- Module 2 – Patterns --------------------

    // 2.1 Star Patterns
    {
        moduleOrder: 2, topicOrder: 1,
        hasCoding: true,
        title: 'Right-Angle Star Triangle',
        description: 'Print a right-angle triangle of stars as shown in Kunal\'s patterns video.',
        problemStatement: 'Given N, print a right-angle triangle where row i (1-indexed) has i stars.',
        inputFormat: 'A single integer N.',
        outputFormat: 'N lines of stars.',
        constraints: ['1 <= N <= 20'],
        sampleInput: '4',
        sampleOutput: '*\n**\n***\n****',
        solutionApproach: 'Outer loop i from 1 to N; inner loop j from 1 to i, print star. Println after inner loop.',
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['nested-loops', 'pattern', 'star'],
        javaStarterCode: `import java.util.Scanner;

public class StarTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: Outer loop for rows (1 to n)
        //       Inner loop for stars (1 to i)
        //       Print newline after each row
    }
}`,
        testCases: [
            { input: '4', expectedOutput: '*\n**\n***\n****', isHidden: false },
            { input: '1', expectedOutput: '*', isHidden: false },
            { input: '5', expectedOutput: '*\n**\n***\n****\n*****', isHidden: true },
        ],
        hints: [
            'Use System.out.print("*") inside the inner loop.',
            'Use System.out.println() after the inner loop ends.',
        ],
    },

    // 2.2 Number & Character Patterns
    {
        moduleOrder: 2, topicOrder: 2,
        hasCoding: true,
        title: 'Alphabet Triangle Pattern',
        description: 'Print a triangle using characters A, B, C... as shown in Kunal\'s character patterns video.',
        problemStatement: 'Given N, print a triangle where row i contains characters A through the i-th letter.',
        inputFormat: 'A single integer N (N <= 26).',
        outputFormat: 'N lines of characters.',
        constraints: ['1 <= N <= 26'],
        sampleInput: '4',
        sampleOutput: 'A\nAB\nABC\nABCD',
        solutionApproach: 'Outer loop i from 1 to N; inner loop j from 0 to i-1, print (char)(\'A\'+j).',
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['nested-loops', 'char-arithmetic', 'ASCII'],
        javaStarterCode: `import java.util.Scanner;

public class AlphabetTriangle {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: For each row i (1..n), print characters A to i-th letter
        // Hint: (char)('A' + j) gives j-th letter after A
    }
}`,
        testCases: [
            { input: '4', expectedOutput: 'A\nAB\nABC\nABCD', isHidden: false },
            { input: '3', expectedOutput: 'A\nAB\nABC', isHidden: false },
            { input: '1', expectedOutput: 'A', isHidden: true },
        ],
        hints: [
            'Cast int to char: (char)(\'A\' + j).',
            'Inner loop j goes from 0 to i-1 for row i.',
        ],
    },

    // 2.3 Advanced Pattern Problems
    {
        moduleOrder: 2, topicOrder: 3,
        hasCoding: true,
        title: 'Diamond Star Pattern',
        description: 'Print a diamond pattern as demonstrated in Kunal\'s advanced patterns video.',
        problemStatement: 'Given N (odd number for best appearance), print a diamond. Top half has rows 1..N with increasing stars (odd counts: 1,3,5,...), bottom half is a mirror.',
        inputFormat: 'A single integer N (the number of rows in the top half).',
        outputFormat: 'The diamond pattern with 2N-1 total rows.',
        constraints: ['1 <= N <= 15'],
        sampleInput: '4',
        sampleOutput: '   *\n  ***\n *****\n*******\n *****\n  ***\n   *',
        solutionApproach: 'Top half: row i has (2i-1) stars and (N-i) leading spaces. Bottom half: mirror in reverse.',
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['diamond', 'spaces', 'nested-loops', 'pattern'],
        javaStarterCode: `import java.util.Scanner;

public class DiamondPattern {
    static void printRow(int stars, int spaces) {
        // TODO: print 'spaces' spaces then 'stars' stars
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        // TODO: Top half – row i (1..n): spaces = n-i, stars = 2i-1
        // TODO: Bottom half – row i (n-1..1): spaces = n-i, stars = 2i-1
    }
}`,
        testCases: [
            { input: '4', expectedOutput: '   *\n  ***\n *****\n*******\n *****\n  ***\n   *', isHidden: false },
            { input: '1', expectedOutput: '*', isHidden: false },
            { input: '3', expectedOutput: '  *\n ***\n*****\n ***\n  *', isHidden: true },
        ],
        hints: [
            'Top half: for row i from 1 to n, print (n-i) spaces then (2i-1) stars.',
            'Bottom half: for row i from n-1 down to 1, same formula.',
        ],
    },

    // -------------------- Module 3 – Arrays --------------------

    // 3.1 1D Arrays & ArrayList
    {
        moduleOrder: 3, topicOrder: 1,
        hasCoding: true,
        title: 'Reverse an Array',
        description: 'Reverse an array in-place — a core array manipulation from Kunal\'s arrays video.',
        problemStatement: 'Given an array of N integers, reverse it in-place and print the result.',
        inputFormat: 'First line: N. Second line: N space-separated integers.',
        outputFormat: 'N space-separated integers in reversed order.',
        constraints: ['1 <= N <= 10^5', '-10^9 <= arr[i] <= 10^9'],
        sampleInput: '5\n1 2 3 4 5',
        sampleOutput: '5 4 3 2 1',
        solutionApproach: 'Two-pointer: swap arr[left] and arr[right], move pointers inward.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['array', 'two-pointer', 'in-place'],
        javaStarterCode: `import java.util.Scanner;

public class ReverseArray {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        // TODO: Reverse arr in-place using two pointers (left, right)

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]);
            if (i < n - 1) sb.append(' ');
        }
        System.out.println(sb);
    }
}`,
        testCases: [
            { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
            { input: '1\n42', expectedOutput: '42', isHidden: false },
            { input: '4\n10 20 30 40', expectedOutput: '40 30 20 10', isHidden: true },
        ],
        hints: [
            'Use left=0, right=n-1; swap and move both inward until left >= right.',
            'Swap: int tmp = arr[left]; arr[left] = arr[right]; arr[right] = tmp;',
        ],
    },

    // 3.2 2D Arrays & Matrix
    {
        moduleOrder: 3, topicOrder: 2,
        hasCoding: true,
        title: 'Transpose a Matrix',
        description: 'Transpose an N×N matrix in-place as shown in Kunal\'s 2D arrays video.',
        problemStatement: 'Given an N×N matrix, print its transpose.',
        inputFormat: 'First line: N. Next N lines: N space-separated integers each.',
        outputFormat: 'N lines representing the transposed matrix.',
        constraints: ['1 <= N <= 100', '-10^4 <= matrix[i][j] <= 10^4'],
        sampleInput: '3\n1 2 3\n4 5 6\n7 8 9',
        sampleOutput: '1 4 7\n2 5 8\n3 6 9',
        solutionApproach: 'For i<j, swap matrix[i][j] with matrix[j][i].',
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['2D-array', 'matrix', 'transpose'],
        javaStarterCode: `import java.util.Scanner;

public class MatrixTranspose {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] mat = new int[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                mat[i][j] = sc.nextInt();

        // TODO: Transpose in-place: swap mat[i][j] with mat[j][i] for i < j

        for (int i = 0; i < n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                sb.append(mat[i][j]);
                if (j < n - 1) sb.append(' ');
            }
            System.out.println(sb);
        }
    }
}`,
        testCases: [
            { input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 4 7\n2 5 8\n3 6 9', isHidden: false },
            { input: '2\n1 2\n3 4', expectedOutput: '1 3\n2 4', isHidden: false },
            { input: '1\n5', expectedOutput: '5', isHidden: true },
        ],
        hints: [
            'Only iterate i from 0 to n-1, j from i+1 to n-1 to avoid double-swapping.',
        ],
    },

    // 3.3 Array Algorithms (Kadane, Two-Pointer)
    {
        moduleOrder: 3, topicOrder: 3,
        hasCoding: true,
        title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
        description: 'Implement Kadane\'s algorithm as taught in Kunal\'s array algorithms video.',
        problemStatement: 'Given an array of N integers (may include negatives), find the maximum sum of any contiguous subarray.',
        inputFormat: 'First line: N. Second line: N space-separated integers.',
        outputFormat: 'A single integer — the maximum subarray sum.',
        constraints: ['1 <= N <= 10^5', '-10^4 <= arr[i] <= 10^4'],
        sampleInput: '8\n-2 1 -3 4 -1 2 1 -5',
        sampleOutput: '6',
        solutionApproach: 'Track currentSum and maxSum. Reset currentSum to 0 when it goes negative.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ["Kadane's", 'max-subarray', 'array'],
        javaStarterCode: `import java.util.Scanner;

public class MaxSubarray {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        long maxSum = Long.MIN_VALUE;
        long currentSum = 0;

        for (int i = 0; i < n; i++) {
            currentSum += arr[i];
            // TODO: update maxSum if currentSum is larger
            // TODO: reset currentSum to 0 if it becomes negative
        }

        System.out.println(maxSum);
    }
}`,
        testCases: [
            { input: '8\n-2 1 -3 4 -1 2 1 -5', expectedOutput: '6', isHidden: false },
            { input: '1\n-5', expectedOutput: '-5', isHidden: false },
            { input: '5\n1 2 3 4 5', expectedOutput: '15', isHidden: true },
            { input: '4\n-1 -2 -3 -4', expectedOutput: '-1', isHidden: true },
        ],
        hints: [
            'maxSum must be initialised to a very small value (or arr[0]) to handle all-negative arrays.',
            'Update maxSum = Math.max(maxSum, currentSum) before resetting.',
        ],
    },

    // -------------------- Module 4 – Strings --------------------

    // 4.1 String Basics & Immutability
    {
        moduleOrder: 4, topicOrder: 1,
        hasCoding: true,
        title: 'Reverse Words in a Sentence',
        description: 'Manipulate strings using charAt and substring as covered in Kunal\'s strings video.',
        problemStatement: 'Given a sentence, reverse the order of words. Multiple spaces between words should be collapsed to one.',
        inputFormat: 'A single line of text.',
        outputFormat: 'The sentence with words in reversed order.',
        constraints: ['1 <= length <= 10^4'],
        sampleInput: 'Hello World Java',
        sampleOutput: 'Java World Hello',
        solutionApproach: 'Split by spaces, filter empty tokens, reverse the array, join with single space.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Basic',
        tags: ['String', 'split', 'reverse', 'words'],
        javaStarterCode: `import java.util.Scanner;

public class ReverseWords {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String line = sc.nextLine().trim();
        // TODO: Split line into words (split by one or more spaces: "\\\\s+")
        // TODO: Reverse the words array
        // TODO: Join with single space and print
    }
}`,
        testCases: [
            { input: 'Hello World Java', expectedOutput: 'Java World Hello', isHidden: false },
            { input: 'One', expectedOutput: 'One', isHidden: false },
            { input: 'A B C D', expectedOutput: 'D C B A', isHidden: true },
        ],
        hints: [
            'String.split("\\\\s+") splits on one or more whitespace characters.',
            'Use two pointers or StringBuilder to reverse the words array.',
        ],
    },

    // 4.2 StringBuilder & StringBuffer
    {
        moduleOrder: 4, topicOrder: 2,
        hasCoding: true,
        title: 'Check Palindrome Using StringBuilder',
        description: 'Use StringBuilder.reverse() to check if a string is a palindrome.',
        problemStatement: 'Given a string S (only lowercase letters), print "YES" if it is a palindrome, else "NO".',
        inputFormat: 'A single string S.',
        outputFormat: '"YES" or "NO".',
        constraints: ['1 <= |S| <= 10^5'],
        sampleInput: 'racecar',
        sampleOutput: 'YES',
        solutionApproach: 'Create StringBuilder(S).reverse().toString() and compare with S.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Basic',
        tags: ['StringBuilder', 'palindrome', 'reverse'],
        javaStarterCode: `import java.util.Scanner;

public class PalindromeCheck {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        // TODO: Use StringBuilder to reverse s
        // TODO: Compare reversed with original and print YES or NO
    }
}`,
        testCases: [
            { input: 'racecar', expectedOutput: 'YES', isHidden: false },
            { input: 'hello', expectedOutput: 'NO', isHidden: false },
            { input: 'a', expectedOutput: 'YES', isHidden: true },
            { input: 'abba', expectedOutput: 'YES', isHidden: true },
        ],
        hints: [
            'new StringBuilder(s).reverse().toString() gives the reversed string.',
            'Use .equals() not == to compare strings.',
        ],
    },

    // 4.3 String Pattern Matching
    {
        moduleOrder: 4, topicOrder: 3,
        hasCoding: true,
        title: 'Check Anagram',
        description: 'Determine if two strings are anagrams using frequency counting — from Kunal\'s string recursion video.',
        problemStatement: 'Given two strings A and B of lowercase letters, print "YES" if they are anagrams, else "NO".',
        inputFormat: 'Two lines, each containing a string.',
        outputFormat: '"YES" or "NO".',
        constraints: ['1 <= |A|, |B| <= 10^5'],
        sampleInput: 'listen\nsilent',
        sampleOutput: 'YES',
        solutionApproach: 'If lengths differ: NO. Count char frequencies for A (+1) and B (-1) in int[26]. If all zero: YES.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['anagram', 'frequency-array', 'string'],
        javaStarterCode: `import java.util.Scanner;

public class AnagramCheck {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next();
        String b = sc.next();

        if (a.length() != b.length()) {
            System.out.println("NO");
            return;
        }

        int[] freq = new int[26];
        // TODO: For each char in a, increment freq[char - 'a']
        // TODO: For each char in b, decrement freq[char - 'a']
        // TODO: If any freq[i] != 0, print NO, else YES
    }
}`,
        testCases: [
            { input: 'listen\nsilent', expectedOutput: 'YES', isHidden: false },
            { input: 'hello\nworld', expectedOutput: 'NO', isHidden: false },
            { input: 'abc\ncba', expectedOutput: 'YES', isHidden: true },
        ],
        hints: [
            'Length check first saves time.',
            'A 26-element int array tracks frequency differences.',
        ],
    },

    // -------------------- Module 5 – Searching --------------------

    // 5.1 Linear Search
    {
        moduleOrder: 5, topicOrder: 1,
        hasCoding: true,
        title: 'Linear Search – Find All Occurrences',
        description: 'Implement linear search returning all indices where target appears.',
        problemStatement: 'Given an array of N integers and a target X, print all 0-based indices where X appears. If not found, print -1.',
        inputFormat: 'First line: N. Second line: N integers. Third line: X.',
        outputFormat: 'Space-separated indices or -1.',
        constraints: ['1 <= N <= 10^5', '-10^9 <= arr[i], X <= 10^9'],
        sampleInput: '7\n1 3 5 3 7 3 9\n3',
        sampleOutput: '1 3 5',
        solutionApproach: 'Scan array; collect indices where arr[i] == X. If none found, print -1.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['linear-search', 'array', 'all-occurrences'],
        javaStarterCode: `import java.util.Scanner;

public class LinearSearchAll {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int x = sc.nextInt();

        StringBuilder result = new StringBuilder();
        // TODO: Scan arr; when arr[i] == x, append i to result
        // TODO: If result is empty, print -1, else print result (trim trailing space)
    }
}`,
        testCases: [
            { input: '7\n1 3 5 3 7 3 9\n3', expectedOutput: '1 3 5', isHidden: false },
            { input: '3\n1 2 3\n5', expectedOutput: '-1', isHidden: false },
            { input: '5\n5 5 5 5 5\n5', expectedOutput: '0 1 2 3 4', isHidden: true },
        ],
        hints: [
            'Use a boolean flag or check if StringBuilder is empty to handle "not found".',
        ],
    },

    // 5.2 Binary Search
    {
        moduleOrder: 5, topicOrder: 2,
        hasCoding: true,
        title: 'Binary Search – First and Last Occurrence',
        description: 'Find first and last occurrence of a target in a sorted array using binary search.',
        problemStatement: 'Given a sorted array of N integers and target X, print the first and last index of X. Print "-1 -1" if not found.',
        inputFormat: 'First line: N. Second line: N sorted integers. Third line: X.',
        outputFormat: 'Two integers: first and last index (space-separated).',
        constraints: ['1 <= N <= 10^6', '-10^9 <= arr[i] <= 10^9'],
        sampleInput: '8\n1 2 2 2 3 4 5 5\n2',
        sampleOutput: '1 3',
        solutionApproach: 'Two binary searches: one biasing left (high=mid-1 on match), one biasing right (low=mid+1 on match).',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['binary-search', 'first-occurrence', 'last-occurrence'],
        javaStarterCode: `import java.util.Scanner;

public class FirstLastOccurrence {

    static int firstOccurrence(int[] arr, int x) {
        int low = 0, high = arr.length - 1, result = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == x) {
                result = mid;
                high = mid - 1; // TODO: why high = mid - 1 here?
            } else if (arr[mid] < x) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return result;
    }

    static int lastOccurrence(int[] arr, int x) {
        int low = 0, high = arr.length - 1, result = -1;
        // TODO: Similar to firstOccurrence but update low = mid + 1 on match
        return result;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int x = sc.nextInt();
        System.out.println(firstOccurrence(arr, x) + " " + lastOccurrence(arr, x));
    }
}`,
        testCases: [
            { input: '8\n1 2 2 2 3 4 5 5\n2', expectedOutput: '1 3', isHidden: false },
            { input: '5\n1 2 3 4 5\n6', expectedOutput: '-1 -1', isHidden: false },
            { input: '5\n1 1 1 1 1\n1', expectedOutput: '0 4', isHidden: true },
        ],
        hints: [
            'For first occurrence: when arr[mid]==x, save mid and search left (high = mid-1).',
            'For last occurrence: when arr[mid]==x, save mid and search right (low = mid+1).',
        ],
    },

    // 5.3 Binary Search Interview Questions
    {
        moduleOrder: 5, topicOrder: 3,
        hasCoding: true,
        title: 'Find Peak Element',
        description: 'Binary search application: find any peak element in an array.',
        problemStatement: 'A peak element is one that is greater than its neighbours. Given array of N distinct integers, find and print the index of any peak element.',
        inputFormat: 'First line: N. Second line: N integers.',
        outputFormat: 'A single integer — index of any peak element.',
        constraints: ['1 <= N <= 10^5', 'arr[-1] = arr[N] = -∞ (treat boundaries as negative infinity)'],
        sampleInput: '5\n1 3 5 2 4',
        sampleOutput: '2',
        solutionApproach: 'Binary search: if arr[mid] < arr[mid+1], peak is right; else left or mid.',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['binary-search', 'peak-element'],
        javaStarterCode: `import java.util.Scanner;

public class PeakElement {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        int low = 0, high = n - 1;
        while (low < high) {
            int mid = low + (high - low) / 2;
            // TODO: if arr[mid] < arr[mid+1], peak is in right half → low = mid+1
            // TODO: else peak is in left half or at mid → high = mid
        }
        System.out.println(low); // low == high at peak
    }
}`,
        testCases: [
            { input: '5\n1 3 5 2 4', expectedOutput: '2', isHidden: false },
            { input: '3\n1 2 1', expectedOutput: '1', isHidden: false },
            { input: '1\n7', expectedOutput: '0', isHidden: true },
        ],
        hints: [
            'Any peak is acceptable — multiple correct answers exist.',
            'When arr[mid] < arr[mid+1], the right side must have a peak.',
        ],
    },

    // -------------------- Module 6 – Sorting --------------------

    // 6.1 Basic Sorting
    {
        moduleOrder: 6, topicOrder: 1,
        hasCoding: true,
        title: 'Insertion Sort Implementation',
        description: 'Implement insertion sort as taught in Kunal\'s basic sorting video.',
        problemStatement: 'Given N integers, sort them in ascending order using Insertion Sort and print the sorted array.',
        inputFormat: 'First line: N. Second line: N integers.',
        outputFormat: 'N space-separated sorted integers.',
        constraints: ['1 <= N <= 1000', '-10^6 <= arr[i] <= 10^6'],
        sampleInput: '5\n5 3 1 4 2',
        sampleOutput: '1 2 3 4 5',
        solutionApproach: 'For each element, find its correct position in the sorted prefix by shifting larger elements right.',
        timeComplexity: 'O(N²)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['insertion-sort', 'sorting'],
        javaStarterCode: `import java.util.Scanner;

public class InsertionSort {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        // TODO: Insertion sort
        // For i from 1 to n-1:
        //   key = arr[i]
        //   j = i - 1
        //   while j >= 0 && arr[j] > key: arr[j+1] = arr[j]; j--
        //   arr[j+1] = key

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]);
            if (i < n - 1) sb.append(' ');
        }
        System.out.println(sb);
    }
}`,
        testCases: [
            { input: '5\n5 3 1 4 2', expectedOutput: '1 2 3 4 5', isHidden: false },
            { input: '1\n7', expectedOutput: '7', isHidden: false },
            { input: '4\n4 3 2 1', expectedOutput: '1 2 3 4', isHidden: true },
        ],
        hints: [
            'The key element is "inserted" into its correct position in the already-sorted prefix.',
            'Shift elements one position right while arr[j] > key.',
        ],
    },

    // 6.2 Advanced Sorting
    {
        moduleOrder: 6, topicOrder: 2,
        hasCoding: true,
        title: 'Merge Sort Implementation',
        description: 'Implement merge sort as taught in Kunal\'s advanced sorting video.',
        problemStatement: 'Sort N integers using Merge Sort and print the sorted array.',
        inputFormat: 'First line: N. Second line: N integers.',
        outputFormat: 'N space-separated sorted integers.',
        constraints: ['1 <= N <= 10^5', '-10^9 <= arr[i] <= 10^9'],
        sampleInput: '6\n38 27 43 3 9 82',
        sampleOutput: '3 9 27 38 43 82',
        solutionApproach: 'Divide array in half, recursively sort, then merge two sorted halves with two-pointer.',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Medium',
        tags: ['merge-sort', 'divide-and-conquer', 'recursion'],
        javaStarterCode: `import java.util.Scanner;

public class MergeSort {

    static void merge(int[] arr, int left, int mid, int right) {
        // TODO: Create temp arrays for left and right halves
        // TODO: Merge them back into arr[left..right] in sorted order
    }

    static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return; // base case
        int mid = left + (right - left) / 2;
        // TODO: recursively sort left half
        // TODO: recursively sort right half
        // TODO: merge the two halves
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        mergeSort(arr, 0, n - 1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(arr[i]);
            if (i < n - 1) sb.append(' ');
        }
        System.out.println(sb);
    }
}`,
        testCases: [
            { input: '6\n38 27 43 3 9 82', expectedOutput: '3 9 27 38 43 82', isHidden: false },
            { input: '1\n5', expectedOutput: '5', isHidden: false },
            { input: '5\n5 4 3 2 1', expectedOutput: '1 2 3 4 5', isHidden: true },
        ],
        hints: [
            'The merge step needs a temporary array of size (right-left+1).',
            'Use two pointers i and j for the left and right halves respectively.',
        ],
    },

    // 6.3 Specialised Sorting
    {
        moduleOrder: 6, topicOrder: 3,
        hasCoding: true,
        title: 'Find Missing Number Using Cyclic Sort',
        description: 'Apply cyclic sort to find the missing number in [1..N] as shown in Kunal\'s specialised sorting video.',
        problemStatement: 'Given an array of N integers containing numbers from 1 to N+1 with exactly one missing, find the missing number.',
        inputFormat: 'First line: N. Second line: N integers.',
        outputFormat: 'The missing number.',
        constraints: ['1 <= N <= 10^5'],
        sampleInput: '5\n3 1 5 4 6',
        sampleOutput: '2',
        solutionApproach: 'Cyclic sort: place each number at index number-1. After sorting, the index where arr[i] != i+1 is the answer.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['cyclic-sort', 'missing-number'],
        javaStarterCode: `import java.util.Scanner;

public class MissingNumber {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();

        // TODO: Cyclic sort
        // while arr[i] != i+1 and arr[i] <= n:
        //   swap arr[i] with arr[arr[i]-1]
        //   then check again
        //   else i++

        // TODO: Scan to find where arr[i] != i+1
        // That index+1 is the missing number (or N+1 if all placed correctly)
        System.out.println(0); // replace with answer
    }
}`,
        testCases: [
            { input: '5\n3 1 5 4 6', expectedOutput: '2', isHidden: false },
            { input: '3\n1 2 3', expectedOutput: '4', isHidden: false },
            { input: '4\n4 3 1 2', expectedOutput: '5', isHidden: true },
        ],
        hints: [
            'In cyclic sort, only swap if arr[i] is in range [1, n] and not already at correct index.',
            'After the sort, the first index where arr[i] != i+1 reveals the missing number.',
        ],
    },

    // -------------------- Module 7 – Recursion --------------------

    // 7.1 Recursion Fundamentals
    {
        moduleOrder: 7, topicOrder: 1,
        hasCoding: true,
        title: 'Power Function (Fast Exponentiation)',
        description: 'Implement O(log N) power function using recursion as shown in Kunal\'s recursion video.',
        problemStatement: 'Given base B and exponent N, compute B^N mod 10^9+7.',
        inputFormat: 'Two integers B and N on one line.',
        outputFormat: 'B^N mod 10^9+7.',
        constraints: ['0 <= B <= 10^9', '0 <= N <= 10^9'],
        sampleInput: '2 10',
        sampleOutput: '1024',
        solutionApproach: 'If N==0 return 1. If N is even: power(B²,N/2). If odd: B * power(B,N-1).',
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(log N)',
        difficulty: 'Medium',
        tags: ['recursion', 'fast-exponentiation', 'modulo'],
        javaStarterCode: `import java.util.Scanner;

public class FastPower {
    static final long MOD = 1_000_000_007L;

    static long power(long base, long exp) {
        if (exp == 0) return 1;
        // TODO: if exp is even → power(base*base % MOD, exp/2)
        // TODO: if exp is odd  → base * power(base, exp-1) % MOD
        return 0; // replace
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long b = sc.nextLong();
        long n = sc.nextLong();
        System.out.println(power(b, n));
    }
}`,
        testCases: [
            { input: '2 10', expectedOutput: '1024', isHidden: false },
            { input: '3 0', expectedOutput: '1', isHidden: false },
            { input: '2 30', expectedOutput: '73741817', isHidden: true },
        ],
        hints: [
            'For even exponent: power(b*b, n/2) halves the problem.',
            'Always take modulo after each multiplication to prevent overflow.',
        ],
    },

    // 7.2 Recursive Problem Solving
    {
        moduleOrder: 7, topicOrder: 2,
        hasCoding: true,
        title: 'Generate All Subsets',
        description: 'Generate the power set using recursion as shown in Kunal\'s recursion subset video.',
        problemStatement: 'Given N distinct integers, print all 2^N subsets (each on a new line, elements space-separated). Print empty line for the empty subset. Output in any order.',
        inputFormat: 'First line: N. Second line: N integers.',
        outputFormat: '2^N lines, each a subset.',
        constraints: ['1 <= N <= 15'],
        sampleInput: '3\n1 2 3',
        sampleOutput: '\n3\n2\n2 3\n1\n1 3\n1 2\n1 2 3',
        solutionApproach: 'Recursive: at each index, include or exclude the element. Base case: index==N, print current subset.',
        timeComplexity: 'O(2^N × N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Medium',
        tags: ['recursion', 'subsets', 'power-set'],
        javaStarterCode: `import java.util.*;

public class AllSubsets {
    static int[] arr;
    static int n;

    static void generate(int index, List<Integer> current) {
        if (index == n) {
            // TODO: Print current list (space-separated); if empty print blank line
            return;
        }
        // TODO: Exclude arr[index] and recurse
        // TODO: Include arr[index], recurse, then remove (backtrack)
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        generate(0, new ArrayList<>());
    }
}`,
        testCases: [
            { input: '2\n1 2', expectedOutput: '\n2\n1\n1 2', isHidden: false },
            { input: '1\n5', expectedOutput: '\n5', isHidden: false },
        ],
        hints: [
            'At each step: first recurse WITHOUT adding arr[index], then recurse WITH arr[index].',
            'Use ArrayList and add/remove for backtracking.',
        ],
    },

    // 7.3 Backtracking
    {
        moduleOrder: 7, topicOrder: 3,
        hasCoding: true,
        title: 'N-Queens Problem',
        description: 'Solve the N-Queens problem using backtracking as taught in Kunal\'s backtracking video.',
        problemStatement: 'Given N, find the total number of ways to place N queens on an N×N chessboard such that no two queens attack each other.',
        inputFormat: 'A single integer N.',
        outputFormat: 'A single integer — total number of valid configurations.',
        constraints: ['1 <= N <= 12'],
        sampleInput: '4',
        sampleOutput: '2',
        solutionApproach: 'Place queens row by row. For each column, check if safe (no clash in column, left-diag, right-diag), recurse, backtrack.',
        timeComplexity: 'O(N!)',
        spaceComplexity: 'O(N)',
        difficulty: 'Hard',
        tags: ['backtracking', 'N-Queens', 'recursion'],
        javaStarterCode: `import java.util.Scanner;

public class NQueens {
    static int n;
    static boolean[] cols, leftDiag, rightDiag;
    static int count = 0;

    static void solve(int row) {
        if (row == n) {
            count++;
            return;
        }
        for (int col = 0; col < n; col++) {
            // TODO: Check if cols[col], leftDiag[row-col+n-1], rightDiag[row+col] are false
            // TODO: If safe: mark all three, recurse(row+1), then unmark (backtrack)
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        cols      = new boolean[n];
        leftDiag  = new boolean[2 * n - 1];
        rightDiag = new boolean[2 * n - 1];
        solve(0);
        System.out.println(count);
    }
}`,
        testCases: [
            { input: '4', expectedOutput: '2', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: false },
            { input: '8', expectedOutput: '92', isHidden: true },
            { input: '12', expectedOutput: '14200', isHidden: true },
        ],
        hints: [
            'leftDiag index = row - col + (n-1); rightDiag index = row + col.',
            'boolean arrays for columns and diagonals give O(1) safety checks.',
        ],
    },

    // -------------------- Module 8 – Linked Lists --------------------

    // 8.1 Singly Linked List
    {
        moduleOrder: 8, topicOrder: 1,
        hasCoding: true,
        title: 'Reverse a Singly Linked List',
        description: 'Reverse a singly linked list iteratively as shown in Kunal\'s linked list video.',
        problemStatement: 'Given N integers forming a singly linked list, reverse it and print the values.',
        inputFormat: 'First line: N. Second line: N space-separated integers.',
        outputFormat: 'N space-separated values of the reversed list.',
        constraints: ['1 <= N <= 10^5'],
        sampleInput: '5\n1 2 3 4 5',
        sampleOutput: '5 4 3 2 1',
        solutionApproach: 'Three pointers: prev=null, current=head, next. At each step: next=current.next, current.next=prev, prev=current, current=next.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['linked-list', 'reverse', 'iterative'],
        javaStarterCode: `import java.util.Scanner;

public class ReverseLinkedList {
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static Node reverse(Node head) {
        Node prev = null, current = head;
        while (current != null) {
            // TODO: Save current.next in a temp variable
            // TODO: current.next = prev
            // TODO: prev = current
            // TODO: current = temp (next)
        }
        return prev; // new head
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Node head = null, tail = null;
        for (int i = 0; i < n; i++) {
            Node node = new Node(sc.nextInt());
            if (head == null) { head = tail = node; }
            else { tail.next = node; tail = node; }
        }
        head = reverse(head);
        StringBuilder sb = new StringBuilder();
        for (Node cur = head; cur != null; cur = cur.next) {
            sb.append(cur.val);
            if (cur.next != null) sb.append(' ');
        }
        System.out.println(sb);
    }
}`,
        testCases: [
            { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
            { input: '1\n42', expectedOutput: '42', isHidden: false },
            { input: '3\n7 8 9', expectedOutput: '9 8 7', isHidden: true },
        ],
        hints: [
            'You must save current.next before overwriting current.next.',
            'After the loop, prev is the new head.',
        ],
    },

    // 8.2 Doubly Linked List & Reversal
    {
        moduleOrder: 8, topicOrder: 2,
        hasCoding: true,
        title: 'Find Middle of a Linked List',
        description: 'Use the slow-fast pointer technique from Kunal\'s doubly linked list and fast-slow pointer video.',
        problemStatement: 'Given N integers as a linked list, find and print the value of the middle node. For even N, print the second middle node.',
        inputFormat: 'First line: N. Second line: N integers.',
        outputFormat: 'Value of the middle node.',
        constraints: ['1 <= N <= 10^5'],
        sampleInput: '5\n1 2 3 4 5',
        sampleOutput: '3',
        solutionApproach: 'Slow moves 1 step, fast moves 2 steps. When fast reaches null or last node, slow is at middle.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Medium',
        tags: ['linked-list', 'fast-slow-pointer', 'middle'],
        javaStarterCode: `import java.util.Scanner;

public class MiddleLinkedList {
    static class Node {
        int val; Node next;
        Node(int v) { val = v; }
    }

    static int findMiddle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            // TODO: slow = slow.next
            // TODO: fast = fast.next.next
        }
        return slow.val;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Node head = null, tail = null;
        for (int i = 0; i < n; i++) {
            Node node = new Node(sc.nextInt());
            if (head == null) { head = tail = node; }
            else { tail.next = node; tail = node; }
        }
        System.out.println(findMiddle(head));
    }
}`,
        testCases: [
            { input: '5\n1 2 3 4 5', expectedOutput: '3', isHidden: false },
            { input: '4\n1 2 3 4', expectedOutput: '3', isHidden: false },
            { input: '1\n7', expectedOutput: '7', isHidden: true },
        ],
        hints: [
            'Condition: fast != null && fast.next != null — otherwise fast.next.next throws NullPointerException.',
        ],
    },

    // 8.3 Circular Linked List & Cycle Detection
    {
        moduleOrder: 8, topicOrder: 3,
        hasCoding: true,
        title: 'Detect Cycle in Linked List (Floyd\'s Algorithm)',
        description: 'Use Floyd\'s cycle detection as taught in Kunal\'s cycle detection video.',
        problemStatement: 'Given a linked list where the last node may point back to a node at 0-based index P (-1 means no cycle), print "CYCLE" or "NO CYCLE".',
        inputFormat: 'First line: N. Second line: N values. Third line: P (cycle tail connects to node at index P, or -1).',
        outputFormat: '"CYCLE" or "NO CYCLE".',
        constraints: ['1 <= N <= 10^4', '-1 <= P < N'],
        sampleInput: '5\n3 2 0 4 5\n1',
        sampleOutput: 'CYCLE',
        solutionApproach: 'Slow and fast pointer. If they ever meet → CYCLE. If fast reaches null → NO CYCLE.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Hard',
        tags: ["Floyd's", 'cycle-detection', 'linked-list'],
        javaStarterCode: `import java.util.Scanner;

public class DetectCycle {
    static class Node {
        int val; Node next;
        Node(int v) { val = v; }
    }

    static boolean hasCycle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            // TODO: If slow == fast, return true (cycle detected)
        }
        return false; // no cycle
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        Node[] nodes = new Node[n];
        for (int i = 0; i < n; i++) nodes[i] = new Node(sc.nextInt());
        for (int i = 0; i < n - 1; i++) nodes[i].next = nodes[i + 1];
        int p = sc.nextInt();
        if (p != -1) nodes[n - 1].next = nodes[p]; // create cycle
        System.out.println(hasCycle(nodes[0]) ? "CYCLE" : "NO CYCLE");
    }
}`,
        testCases: [
            { input: '5\n3 2 0 4 5\n1', expectedOutput: 'CYCLE', isHidden: false },
            { input: '3\n1 2 3\n-1', expectedOutput: 'NO CYCLE', isHidden: false },
            { input: '4\n1 2 3 4\n0', expectedOutput: 'CYCLE', isHidden: true },
        ],
        hints: [
            'After slow and fast meet, you\'ve confirmed a cycle.',
            'If fast or fast.next is null, the list has no cycle.',
        ],
    },

    // -------------------- Module 9 – Stack & Queue --------------------

    // 9.1 Stack Implementation
    {
        moduleOrder: 9, topicOrder: 1,
        hasCoding: true,
        title: 'Valid Parentheses',
        description: 'Classic stack application: check balanced parentheses as in Kunal\'s stack video.',
        problemStatement: 'Given a string containing \'(\', \')\', \'{\', \'}\', \'[\', \']\', determine if the input string is valid. A string is valid if every opening bracket has a corresponding closing bracket in the correct order.',
        inputFormat: 'A single string of bracket characters.',
        outputFormat: '"YES" or "NO".',
        constraints: ['1 <= |S| <= 10^5'],
        sampleInput: '{[()]}',
        sampleOutput: 'YES',
        solutionApproach: 'Push opening brackets. On closing bracket, pop and check if it matches. Valid if stack is empty at end.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Medium',
        tags: ['stack', 'balanced-parentheses', 'LIFO'],
        javaStarterCode: `import java.util.*;

public class ValidParentheses {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        Deque<Character> stack = new ArrayDeque<>();
        boolean valid = true;

        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                // TODO: push c onto stack
            } else {
                // TODO: if stack is empty → invalid
                // TODO: pop top and check if it matches c's opening pair
                // '(' matches ')', '{' matches '}', '[' matches ']'
            }
        }

        // TODO: valid only if stack is empty AND valid flag is true
        System.out.println(valid && stack.isEmpty() ? "YES" : "NO");
    }
}`,
        testCases: [
            { input: '{[()]}', expectedOutput: 'YES', isHidden: false },
            { input: '([)]', expectedOutput: 'NO', isHidden: false },
            { input: '()', expectedOutput: 'YES', isHidden: true },
            { input: ']', expectedOutput: 'NO', isHidden: true },
        ],
        hints: [
            'Use a Map to pair closing brackets to their opening counterparts.',
            'If stack is empty when a closing bracket arrives, return NO immediately.',
        ],
    },

    // 9.2 Queue & Circular Queue
    {
        moduleOrder: 9, topicOrder: 2,
        hasCoding: true,
        title: 'Implement Queue Using Two Stacks',
        description: 'Implement FIFO queue using two stacks as taught in Kunal\'s stack & queue interview problems video.',
        problemStatement: 'Simulate a queue with operations: ENQUEUE x and DEQUEUE. For DEQUEUE on empty queue, print -1. For each DEQUEUE, print the removed element.',
        inputFormat: 'First line: Q (number of operations). Next Q lines: operation.',
        outputFormat: 'Output for each DEQUEUE.',
        constraints: ['1 <= Q <= 10^4', '1 <= x <= 10^9'],
        sampleInput: '6\nENQUEUE 1\nENQUEUE 2\nDEQUEUE\nENQUEUE 3\nDEQUEUE\nDEQUEUE',
        sampleOutput: '1\n2\n3',
        solutionApproach: 'Stack1 for enqueue. On dequeue: if stack2 empty, pour all from stack1 to stack2, then pop stack2.',
        timeComplexity: 'O(1) amortized per operation',
        spaceComplexity: 'O(N)',
        difficulty: 'Medium',
        tags: ['queue', 'stack', 'two-stacks'],
        javaStarterCode: `import java.util.*;

public class QueueUsingStacks {
    static Deque<Integer> s1 = new ArrayDeque<>(); // enqueue stack
    static Deque<Integer> s2 = new ArrayDeque<>(); // dequeue stack

    static void enqueue(int x) {
        s1.push(x);
    }

    static int dequeue() {
        if (s2.isEmpty()) {
            // TODO: Pour all elements from s1 into s2
        }
        // TODO: if s2 is still empty, return -1 (queue empty)
        return s2.isEmpty() ? -1 : s2.pop();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int q = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            String op = sc.next();
            if (op.equals("ENQUEUE")) {
                enqueue(sc.nextInt());
            } else {
                int val = dequeue();
                if (val != -1) sb.append(val).append('\n');
                else sb.append(-1).append('\n');
            }
        }
        System.out.print(sb);
    }
}`,
        testCases: [
            { input: '6\nENQUEUE 1\nENQUEUE 2\nDEQUEUE\nENQUEUE 3\nDEQUEUE\nDEQUEUE', expectedOutput: '1\n2\n3', isHidden: false },
            { input: '2\nDEQUEUE\nENQUEUE 5', expectedOutput: '-1', isHidden: false },
        ],
        hints: [
            'Only transfer from s1 to s2 when s2 is completely empty.',
            'After transfer, s2 has elements in FIFO order (topmost = front of queue).',
        ],
    },

    // 9.3 Deque & PriorityQueue
    {
        moduleOrder: 9, topicOrder: 3,
        hasCoding: true,
        title: 'K Largest Elements Using PriorityQueue',
        description: 'Find K largest elements using a min-heap PriorityQueue as covered in Kunal\'s deque & priority queue video.',
        problemStatement: 'Given N integers and K, print the K largest elements in ascending order.',
        inputFormat: 'First line: N and K. Second line: N integers.',
        outputFormat: 'K space-separated integers in ascending order.',
        constraints: ['1 <= K <= N <= 10^5', '-10^9 <= arr[i] <= 10^9'],
        sampleInput: '7 3\n3 1 4 1 5 9 2',
        sampleOutput: '4 5 9',
        solutionApproach: 'Min-heap of size K. For each element: if larger than heap top, replace. Final heap contains K largest.',
        timeComplexity: 'O(N log K)',
        spaceComplexity: 'O(K)',
        difficulty: 'Medium',
        tags: ['PriorityQueue', 'min-heap', 'k-largest'],
        javaStarterCode: `import java.util.*;

public class KLargest {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), k = sc.nextInt();
        PriorityQueue<Integer> minHeap = new PriorityQueue<>(); // default min-heap

        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            // TODO: Add x to minHeap
            // TODO: If minHeap size > k, remove the smallest (poll)
        }

        // minHeap now contains the k largest elements
        int[] result = new int[k];
        for (int i = k - 1; i >= 0; i--) result[i] = minHeap.poll();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < k; i++) {
            sb.append(result[i]);
            if (i < k - 1) sb.append(' ');
        }
        System.out.println(sb);
    }
}`,
        testCases: [
            { input: '7 3\n3 1 4 1 5 9 2', expectedOutput: '4 5 9', isHidden: false },
            { input: '5 1\n5 4 3 2 1', expectedOutput: '5', isHidden: false },
            { input: '4 4\n1 2 3 4', expectedOutput: '1 2 3 4', isHidden: true },
        ],
        hints: [
            'After processing all elements, the heap has exactly K elements — the K largest.',
            'Extract in reverse order (poll into array from back) to get ascending order.',
        ],
    },

    // -------------------- Module 10 – Trees --------------------

    // 10.1 Binary Tree Fundamentals
    {
        moduleOrder: 10, topicOrder: 1,
        hasCoding: true,
        title: 'Level Order Traversal (BFS)',
        description: 'Perform level-order traversal of a binary tree as taught in Kunal\'s trees introduction video.',
        problemStatement: 'Given a binary tree in level-order input (-1 means null), print each level on a separate line (space-separated values).',
        inputFormat: 'Space-separated integers in level order (-1 for null).',
        outputFormat: 'Each level\'s values on a separate line.',
        constraints: ['1 <= nodes <= 1000', '-10^4 <= node value <= 10^4'],
        sampleInput: '1 2 3 4 5 -1 6',
        sampleOutput: '1\n2 3\n4 5 6',
        solutionApproach: 'Build tree from level-order input. BFS with queue; process level-by-level using size counter.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Medium',
        tags: ['binary-tree', 'BFS', 'level-order', 'queue'],
        javaStarterCode: `import java.util.*;

public class LevelOrderTraversal {
    static class Node {
        int val; Node left, right;
        Node(int v) { val = v; }
    }

    static Node buildTree(int[] arr) {
        if (arr.length == 0 || arr[0] == -1) return null;
        Node root = new Node(arr[0]);
        Queue<Node> q = new LinkedList<>();
        q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < arr.length) {
            Node cur = q.poll();
            if (i < arr.length && arr[i] != -1) { cur.left  = new Node(arr[i]); q.offer(cur.left); }
            i++;
            if (i < arr.length && arr[i] != -1) { cur.right = new Node(arr[i]); q.offer(cur.right); }
            i++;
        }
        return root;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] arr = list.stream().mapToInt(Integer::intValue).toArray();
        Node root = buildTree(arr);

        // TODO: BFS level-order traversal
        // Use a Queue<Node>; for each level, process 'size' nodes and collect values
        // Print each level's values space-separated on one line
    }
}`,
        testCases: [
            { input: '1 2 3 4 5 -1 6', expectedOutput: '1\n2 3\n4 5 6', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: false },
            { input: '1 2 -1 3', expectedOutput: '1\n2\n3', isHidden: true },
        ],
        hints: [
            'Record queue.size() before processing each level; process exactly that many nodes.',
            'After processing, offer non-null children to the queue.',
        ],
    },

    // 10.2 Binary Search Tree
    {
        moduleOrder: 10, topicOrder: 2,
        hasCoding: true,
        title: 'Validate Binary Search Tree',
        description: 'Validate a BST by passing min/max bounds as taught in Kunal\'s BST interview questions video.',
        problemStatement: 'Given a binary tree in level-order (-1 = null), determine if it is a valid BST. Print "YES" or "NO".',
        inputFormat: 'Space-separated integers in level order (-1 for null).',
        outputFormat: '"YES" or "NO".',
        constraints: ['1 <= nodes <= 1000', '-10^4 <= node value <= 10^4'],
        sampleInput: '5 3 7 2 4 6 8',
        sampleOutput: 'YES',
        solutionApproach: 'Recursive validate(node, min, max): node.val must be in (min, max). Left: max=node.val, Right: min=node.val.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(H)',
        difficulty: 'Medium',
        tags: ['BST', 'validate', 'recursion', 'min-max-bounds'],
        javaStarterCode: `import java.util.*;

public class ValidateBST {
    static class Node { int val; Node left, right; Node(int v){val=v;} }

    static Node buildTree(int[] a) {
        if (a.length == 0 || a[0] == -1) return null;
        Node root = new Node(a[0]);
        Queue<Node> q = new LinkedList<>(); q.offer(root);
        int i = 1;
        while (!q.isEmpty() && i < a.length) {
            Node c = q.poll();
            if (i < a.length && a[i] != -1) { c.left  = new Node(a[i]); q.offer(c.left); } i++;
            if (i < a.length && a[i] != -1) { c.right = new Node(a[i]); q.offer(c.right); } i++;
        }
        return root;
    }

    static boolean validate(Node node, long min, long max) {
        if (node == null) return true;
        // TODO: if node.val <= min || node.val >= max → return false
        // TODO: recursively validate left subtree with max = node.val
        // TODO: recursively validate right subtree with min = node.val
        return true; // replace
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] arr = list.stream().mapToInt(Integer::intValue).toArray();
        Node root = buildTree(arr);
        System.out.println(validate(root, Long.MIN_VALUE, Long.MAX_VALUE) ? "YES" : "NO");
    }
}`,
        testCases: [
            { input: '5 3 7 2 4 6 8', expectedOutput: 'YES', isHidden: false },
            { input: '5 3 7 2 6 6 8', expectedOutput: 'NO', isHidden: false },
            { input: '1', expectedOutput: 'YES', isHidden: true },
        ],
        hints: [
            'Use Long.MIN_VALUE and Long.MAX_VALUE as initial bounds to handle int edge cases.',
            'Every node must satisfy min < node.val < max — not just relative to its direct parent.',
        ],
    },

    // 10.3 Tree Traversals & Views
    {
        moduleOrder: 10, topicOrder: 3,
        hasCoding: true,
        title: 'Right View of Binary Tree',
        description: 'Print the right view of a binary tree using BFS as shown in Kunal\'s tree traversal and views video.',
        problemStatement: 'Given a binary tree in level-order (-1=null), print the rightmost node at each level (right view).',
        inputFormat: 'Space-separated integers in level order.',
        outputFormat: 'Right view values, one per line.',
        constraints: ['1 <= nodes <= 1000'],
        sampleInput: '1 2 3 4 5 -1 6',
        sampleOutput: '1\n3\n6',
        solutionApproach: 'BFS level-order. At each level, the last node processed is the right view node.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Hard',
        tags: ['binary-tree', 'right-view', 'BFS', 'level-order'],
        javaStarterCode: `import java.util.*;

public class RightView {
    static class Node { int val; Node left, right; Node(int v){val=v;} }
    static Node buildTree(int[] a) {
        if (a.length==0||a[0]==-1) return null;
        Node root=new Node(a[0]); Queue<Node> q=new LinkedList<>(); q.offer(root); int i=1;
        while(!q.isEmpty()&&i<a.length){Node c=q.poll();
        if(i<a.length&&a[i]!=-1){c.left=new Node(a[i]);q.offer(c.left);}i++;
        if(i<a.length&&a[i]!=-1){c.right=new Node(a[i]);q.offer(c.right);}i++;}
        return root;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> list = new ArrayList<>();
        while (sc.hasNextInt()) list.add(sc.nextInt());
        int[] arr = list.stream().mapToInt(Integer::intValue).toArray();
        Node root = buildTree(arr);
        if (root == null) return;

        Queue<Node> q = new LinkedList<>();
        q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            int rightVal = 0;
            for (int i = 0; i < size; i++) {
                Node cur = q.poll();
                rightVal = cur.val; // TODO: track last node value at this level
                if (cur.left  != null) q.offer(cur.left);
                if (cur.right != null) q.offer(cur.right);
            }
            // TODO: Print rightVal after processing each level
        }
    }
}`,
        testCases: [
            { input: '1 2 3 4 5 -1 6', expectedOutput: '1\n3\n6', isHidden: false },
            { input: '1 2 -1 3', expectedOutput: '1\n2\n3', isHidden: false },
            { input: '5', expectedOutput: '5', isHidden: true },
        ],
        hints: [
            'The last node visited in each BFS level is the rightmost visible node.',
            'Simply print the last cur.val of each level after the inner for-loop.',
        ],
    },

    // -------------------- Module 11 – Heaps & Hashing --------------------

    // 11.1 Heap Data Structure
    {
        moduleOrder: 11, topicOrder: 1,
        hasCoding: true,
        title: 'Kth Largest Element in Array',
        description: 'Find the Kth largest element using a min-heap as shown in Kunal\'s heaps video.',
        problemStatement: 'Given N integers and K, find the Kth largest element.',
        inputFormat: 'First line: N and K. Second line: N integers.',
        outputFormat: 'The Kth largest element.',
        constraints: ['1 <= K <= N <= 10^5', '-10^9 <= arr[i] <= 10^9'],
        sampleInput: '6 2\n3 2 1 5 6 4',
        sampleOutput: '5',
        solutionApproach: 'Min-heap of size K. For each element larger than heap top, replace top. Final heap top is answer.',
        timeComplexity: 'O(N log K)',
        spaceComplexity: 'O(K)',
        difficulty: 'Medium',
        tags: ['heap', 'min-heap', 'kth-largest', 'PriorityQueue'],
        javaStarterCode: `import java.util.*;

public class KthLargest {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), k = sc.nextInt();
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            minHeap.offer(x);
            // TODO: if minHeap.size() > k, poll (removes smallest)
        }
        // TODO: The top of minHeap is the kth largest
        System.out.println(minHeap.peek());
    }
}`,
        testCases: [
            { input: '6 2\n3 2 1 5 6 4', expectedOutput: '5', isHidden: false },
            { input: '5 5\n1 2 3 4 5', expectedOutput: '1', isHidden: false },
            { input: '3 1\n7 8 9', expectedOutput: '9', isHidden: true },
        ],
        hints: [
            'After maintaining a heap of size exactly K, the minimum (heap top) is the Kth largest.',
        ],
    },

    // 11.2 HashMap & HashSet Internals
    {
        moduleOrder: 11, topicOrder: 2,
        hasCoding: true,
        title: 'First Non-Repeating Character',
        description: 'Use HashMap to find the first non-repeating character in a string.',
        problemStatement: 'Given a string S of lowercase letters, print the first character that appears exactly once. If none exists, print -1.',
        inputFormat: 'A single string S.',
        outputFormat: 'A single character or -1.',
        constraints: ['1 <= |S| <= 10^5'],
        sampleInput: 'loveleetcode',
        sampleOutput: 'v',
        solutionApproach: 'Count frequencies with HashMap. Second pass: return first character with frequency 1.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1) — at most 26 entries',
        difficulty: 'Basic',
        tags: ['HashMap', 'frequency', 'string'],
        javaStarterCode: `import java.util.*;

public class FirstNonRepeating {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        Map<Character, Integer> freq = new LinkedHashMap<>();
        // TODO: Count frequency of each character
        // TODO: Iterate s again; return first char with freq == 1
        // TODO: If none found, print -1
    }
}`,
        testCases: [
            { input: 'loveleetcode', expectedOutput: 'v', isHidden: false },
            { input: 'aabb', expectedOutput: '-1', isHidden: false },
            { input: 'z', expectedOutput: 'z', isHidden: true },
        ],
        hints: [
            'LinkedHashMap preserves insertion order, making the second pass easier.',
            'Use getOrDefault(c, 0) + 1 to count frequencies.',
        ],
    },

    // 11.3 Advanced Hashing (Rabin-Karp)
    {
        moduleOrder: 11, topicOrder: 3,
        hasCoding: true,
        title: 'Pattern Matching with Rabin-Karp',
        description: 'Implement Rabin-Karp string matching with rolling hash as taught in Kunal\'s hashing video.',
        problemStatement: 'Given text T and pattern P, print all 0-based start indices where P occurs in T. Print -1 if not found.',
        inputFormat: 'First line: T. Second line: P.',
        outputFormat: 'Space-separated indices or -1.',
        constraints: ['1 <= |P| <= |T| <= 10^5'],
        sampleInput: 'aababab\nab',
        sampleOutput: '1 3 5',
        solutionApproach: 'Compute pattern hash. Slide window over T with rolling hash. On hash match, verify characters.',
        timeComplexity: 'O(N + M) average',
        spaceComplexity: 'O(1)',
        difficulty: 'Hard',
        tags: ['Rabin-Karp', 'rolling-hash', 'pattern-matching'],
        javaStarterCode: `import java.util.*;

public class RabinKarp {
    static final long BASE = 31, MOD = 1_000_000_007L;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String t = sc.next(), p = sc.next();
        int n = t.length(), m = p.length();
        if (m > n) { System.out.println(-1); return; }

        // TODO: Compute hash of pattern p
        // TODO: Compute hash of first window t[0..m-1]
        // TODO: Compute BASE^(m-1) % MOD for rolling hash
        // TODO: Slide window: subtract old char, add new char, compare hashes
        // TODO: On hash match, verify characters (t.substring vs p)
        // Print matching indices or -1

        long patHash = 0, winHash = 0, power = 1;
        List<Integer> result = new ArrayList<>();

        // Placeholder – implement rolling hash
        System.out.println(result.isEmpty() ? -1 :
            result.stream().map(String::valueOf).reduce((a,b)->a+" "+b).get());
    }
}`,
        testCases: [
            { input: 'aababab\nab', expectedOutput: '1 3 5', isHidden: false },
            { input: 'hello\nworld', expectedOutput: '-1', isHidden: false },
            { input: 'aaaa\naa', expectedOutput: '0 1 2', isHidden: true },
        ],
        hints: [
            'Rolling hash: newHash = (oldHash - t[i]*power) * BASE + t[i+m].',
            'Always verify on hash match to handle collisions (spurious hits).',
        ],
    },

    // -------------------- Module 12 – Graphs --------------------

    // 12.1 Graph Representation
    {
        moduleOrder: 12, topicOrder: 1,
        hasCoding: true,
        title: 'Build and Print Adjacency List',
        description: 'Construct a graph adjacency list as shown in Kunal\'s graph representation video.',
        problemStatement: 'Given V vertices and E undirected edges, build the adjacency list and print each vertex\'s neighbours in sorted order.',
        inputFormat: 'First line: V and E. Next E lines: u v (edge between u and v, 0-indexed).',
        outputFormat: 'V lines: vertex i followed by sorted neighbour list.',
        constraints: ['1 <= V <= 100', '0 <= E <= V*(V-1)/2'],
        sampleInput: '4 4\n0 1\n0 2\n1 3\n2 3',
        sampleOutput: '0: 1 2\n1: 0 3\n2: 0 3\n3: 1 2',
        solutionApproach: 'ArrayList[] of size V. For each edge (u,v) add v to adj[u] and u to adj[v]. Sort each list.',
        timeComplexity: 'O(E log E)',
        spaceComplexity: 'O(V + E)',
        difficulty: 'Medium',
        tags: ['graph', 'adjacency-list', 'representation'],
        javaStarterCode: `import java.util.*;

public class AdjacencyList {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int v = sc.nextInt(), e = sc.nextInt();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < v; i++) adj.add(new ArrayList<>());

        for (int i = 0; i < e; i++) {
            int u = sc.nextInt(), w = sc.nextInt();
            // TODO: Add w to adj[u] and u to adj[w] (undirected)
        }

        for (int i = 0; i < v; i++) {
            // TODO: Sort adj[i]
            // TODO: Print "i: " followed by space-separated neighbours
        }
    }
}`,
        testCases: [
            { input: '4 4\n0 1\n0 2\n1 3\n2 3', expectedOutput: '0: 1 2\n1: 0 3\n2: 0 3\n3: 1 2', isHidden: false },
            { input: '3 0', expectedOutput: '0: \n1: \n2: ', isHidden: false },
        ],
        hints: [
            'For undirected graph, each edge appears in both adj[u] and adj[v].',
            'Collections.sort(adj.get(i)) sorts each neighbour list.',
        ],
    },

    // 12.2 BFS & DFS
    {
        moduleOrder: 12, topicOrder: 2,
        hasCoding: true,
        title: 'Count Connected Components (BFS)',
        description: 'Count connected components in an undirected graph using BFS as taught in Kunal\'s BFS/DFS video.',
        problemStatement: 'Given V vertices and E undirected edges, print the number of connected components.',
        inputFormat: 'First line: V and E. Next E lines: u v.',
        outputFormat: 'A single integer — number of connected components.',
        constraints: ['1 <= V <= 10^4', '0 <= E <= 10^5'],
        sampleInput: '5 3\n0 1\n1 2\n3 4',
        sampleOutput: '2',
        solutionApproach: 'BFS from each unvisited vertex. Each new BFS start = new component. Count starts.',
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
        difficulty: 'Medium',
        tags: ['BFS', 'connected-components', 'graph'],
        javaStarterCode: `import java.util.*;

public class ConnectedComponents {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int v = sc.nextInt(), e = sc.nextInt();
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < v; i++) adj.add(new ArrayList<>());
        for (int i = 0; i < e; i++) {
            int u = sc.nextInt(), w = sc.nextInt();
            adj.get(u).add(w); adj.get(w).add(u);
        }

        boolean[] visited = new boolean[v];
        int components = 0;
        for (int i = 0; i < v; i++) {
            if (!visited[i]) {
                components++;
                // TODO: BFS from vertex i; mark all reachable nodes visited
                Queue<Integer> q = new LinkedList<>();
                q.offer(i);
                visited[i] = true;
                while (!q.isEmpty()) {
                    int cur = q.poll();
                    for (int nb : adj.get(cur)) {
                        // TODO: if not visited, mark and enqueue
                    }
                }
            }
        }
        System.out.println(components);
    }
}`,
        testCases: [
            { input: '5 3\n0 1\n1 2\n3 4', expectedOutput: '2', isHidden: false },
            { input: '4 0', expectedOutput: '4', isHidden: false },
            { input: '6 5\n0 1\n1 2\n2 3\n3 4\n4 5', expectedOutput: '1', isHidden: true },
        ],
        hints: [
            'Each time the outer loop finds an unvisited node, it starts a new component.',
            'BFS/DFS marks all nodes in the same component visited.',
        ],
    },

    // 12.3 Shortest Path (Dijkstra)
    {
        moduleOrder: 12, topicOrder: 3,
        hasCoding: true,
        title: 'Dijkstra\'s Shortest Path',
        description: 'Implement Dijkstra\'s algorithm using PriorityQueue as covered in Kunal\'s shortest path video.',
        problemStatement: 'Given a weighted undirected graph with V vertices, E edges, and source S, print shortest distance from S to all vertices. Print -1 if unreachable.',
        inputFormat: 'First line: V, E, S. Next E lines: u v w (edge with weight w).',
        outputFormat: 'V space-separated shortest distances.',
        constraints: ['1 <= V <= 10^4', '0 <= E <= 2×10^5', '0 <= w <= 10^6'],
        sampleInput: '5 6 0\n0 1 4\n0 2 1\n2 1 2\n1 3 1\n2 3 5\n3 4 3',
        sampleOutput: '0 3 1 4 7',
        solutionApproach: 'dist[] = INF, dist[S]=0. PriorityQueue by distance. Relax neighbours when shorter path found.',
        timeComplexity: 'O((V+E) log V)',
        spaceComplexity: 'O(V + E)',
        difficulty: 'Hard',
        tags: ["Dijkstra", 'shortest-path', 'priority-queue', 'graph'],
        javaStarterCode: `import java.util.*;

public class Dijkstra {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int v = sc.nextInt(), e = sc.nextInt(), src = sc.nextInt();
        List<int[]>[] adj = new List[v];
        for (int i = 0; i < v; i++) adj[i] = new ArrayList<>();
        for (int i = 0; i < e; i++) {
            int u = sc.nextInt(), w = sc.nextInt(), wt = sc.nextInt();
            adj[u].add(new int[]{w, wt});
            adj[w].add(new int[]{u, wt});
        }

        long[] dist = new long[v];
        Arrays.fill(dist, Long.MAX_VALUE);
        dist[src] = 0;
        // PriorityQueue: [distance, vertex]
        PriorityQueue<long[]> pq = new PriorityQueue<>(Comparator.comparingLong(a -> a[0]));
        pq.offer(new long[]{0, src});

        while (!pq.isEmpty()) {
            long[] top = pq.poll();
            long d = top[0]; int u = (int) top[1];
            if (d > dist[u]) continue; // stale entry
            for (int[] nb : adj[u]) {
                int nextV = nb[0]; long weight = nb[1];
                // TODO: if dist[u] + weight < dist[nextV], update and enqueue
            }
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < v; i++) {
            sb.append(dist[i] == Long.MAX_VALUE ? -1 : dist[i]);
            if (i < v - 1) sb.append(' ');
        }
        System.out.println(sb);
    }
}`,
        testCases: [
            { input: '5 6 0\n0 1 4\n0 2 1\n2 1 2\n1 3 1\n2 3 5\n3 4 3', expectedOutput: '0 3 1 4 7', isHidden: false },
            { input: '3 2 0\n0 1 5\n1 2 3', expectedOutput: '0 5 8', isHidden: false },
        ],
        hints: [
            'Skip stale queue entries: if d > dist[u], continue.',
            'Use Long.MAX_VALUE as INF and be careful of overflow when adding.',
        ],
    },

    // -------------------- Module 13 – Dynamic Programming --------------------

    // 13.1 DP Fundamentals
    {
        moduleOrder: 13, topicOrder: 1,
        hasCoding: true,
        title: 'Climbing Stairs (Fibonacci DP)',
        description: 'Classic DP warm-up: count ways to climb stairs, exactly as introduced in Kunal\'s DP fundamentals video.',
        problemStatement: 'You can climb 1 or 2 stairs at a time. Given N stairs, print the number of distinct ways to reach the top.',
        inputFormat: 'A single integer N.',
        outputFormat: 'Number of ways (mod 10^9+7).',
        constraints: ['1 <= N <= 10^5'],
        sampleInput: '5',
        sampleOutput: '8',
        solutionApproach: 'dp[1]=1, dp[2]=2, dp[i]=dp[i-1]+dp[i-2]. Space-optimise to O(1) with two variables.',
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        difficulty: 'Basic',
        tags: ['DP', 'fibonacci', 'memoization', 'tabulation'],
        javaStarterCode: `import java.util.Scanner;

public class ClimbingStairs {
    static final int MOD = 1_000_000_007;
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        if (n == 1) { System.out.println(1); return; }
        long prev2 = 1, prev1 = 2;
        // TODO: for i from 3 to n: curr = (prev1 + prev2) % MOD; shift
        System.out.println(n == 2 ? prev1 : 0); // replace 0 with result
    }
}`,
        testCases: [
            { input: '5', expectedOutput: '8', isHidden: false },
            { input: '1', expectedOutput: '1', isHidden: false },
            { input: '10', expectedOutput: '89', isHidden: true },
        ],
        hints: [
            'This is identical to the Fibonacci sequence offset by one: ways(n) = ways(n-1) + ways(n-2).',
            'Space-optimise: only keep the last two values.',
        ],
    },

    // 13.2 Knapsack & Subset DP
    {
        moduleOrder: 13, topicOrder: 2,
        hasCoding: true,
        title: '0/1 Knapsack',
        description: 'Implement the classic 0/1 Knapsack problem using DP as covered in Kunal\'s knapsack video.',
        problemStatement: 'Given N items with weights and values, and a knapsack of capacity W, find the maximum value achievable.',
        inputFormat: 'First line: N and W. Second line: N weights. Third line: N values.',
        outputFormat: 'Maximum value.',
        constraints: ['1 <= N <= 100', '1 <= W <= 10^4', '1 <= weight[i], value[i] <= 1000'],
        sampleInput: '4 5\n1 3 4 5\n1 4 5 7',
        sampleOutput: '9',
        solutionApproach: 'dp[w] = max value using capacity w. For each item, iterate capacity backwards.',
        timeComplexity: 'O(N × W)',
        spaceComplexity: 'O(W)',
        difficulty: 'Hard',
        tags: ['0-1-knapsack', 'DP', 'tabulation'],
        javaStarterCode: `import java.util.Scanner;

public class Knapsack01 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), W = sc.nextInt();
        int[] w = new int[n], v = new int[n];
        for (int i = 0; i < n; i++) w[i] = sc.nextInt();
        for (int i = 0; i < n; i++) v[i] = sc.nextInt();

        int[] dp = new int[W + 1];
        for (int i = 0; i < n; i++) {
            // TODO: Iterate capacity from W down to w[i]
            // TODO: dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i])
        }
        System.out.println(dp[W]);
    }
}`,
        testCases: [
            { input: '4 5\n1 3 4 5\n1 4 5 7', expectedOutput: '9', isHidden: false },
            { input: '3 7\n1 3 4\n1 4 5', expectedOutput: '9', isHidden: false },
            { input: '2 3\n4 5\n1 2', expectedOutput: '0', isHidden: true },
        ],
        hints: [
            'Iterate capacity BACKWARDS (W to w[i]) to ensure each item is used at most once.',
            'Forward iteration would allow using the same item multiple times (unbounded knapsack).',
        ],
    },

    // 13.3 DP on Strings & Grid
    {
        moduleOrder: 13, topicOrder: 3,
        hasCoding: true,
        title: 'Longest Common Subsequence',
        description: 'Implement LCS using 2D DP as taught in Kunal\'s DP on strings video.',
        problemStatement: 'Given two strings A and B, print the length of their Longest Common Subsequence.',
        inputFormat: 'Two lines — strings A and B.',
        outputFormat: 'A single integer — LCS length.',
        constraints: ['1 <= |A|, |B| <= 1000'],
        sampleInput: 'ABCBDAB\nBDCABA',
        sampleOutput: '4',
        solutionApproach: 'dp[i][j] = LCS of A[0..i-1] and B[0..j-1]. If match: dp[i-1][j-1]+1, else max(dp[i-1][j], dp[i][j-1]).',
        timeComplexity: 'O(M × N)',
        spaceComplexity: 'O(M × N)',
        difficulty: 'Hard',
        tags: ['LCS', 'DP', 'strings'],
        javaStarterCode: `import java.util.Scanner;

public class LCS {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next(), b = sc.next();
        int m = a.length(), n = b.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (a.charAt(i-1) == b.charAt(j-1)) {
                    dp[i][j] = dp[i-1][j-1] + 1;
                } else {
                    // TODO: dp[i][j] = max of dp[i-1][j] and dp[i][j-1]
                }
            }
        }
        System.out.println(dp[m][n]);
    }
}`,
        testCases: [
            { input: 'ABCBDAB\nBDCABA', expectedOutput: '4', isHidden: false },
            { input: 'ABC\nABC', expectedOutput: '3', isHidden: false },
            { input: 'AGGTAB\nGXTXAYB', expectedOutput: '4', isHidden: true },
        ],
        hints: [
            'Base case: dp[0][j] = dp[i][0] = 0 (empty string has LCS 0 with anything).',
            'The answer is dp[m][n].',
        ],
    },

    // -------------------- Module 14 – Advanced DSA --------------------

    // 14.1 Tries
    {
        moduleOrder: 14, topicOrder: 1,
        hasCoding: true,
        title: 'Implement Trie – Insert and Search',
        description: 'Build a Trie supporting insert, search, and startsWith as shown in Kunal\'s Trie video.',
        problemStatement: 'Process Q operations on a Trie: INSERT word, SEARCH word (print YES/NO), PREFIX word (print YES/NO if any word starts with prefix).',
        inputFormat: 'First line: Q. Next Q lines: operation and string.',
        outputFormat: 'A line for each SEARCH and PREFIX operation.',
        constraints: ['1 <= Q <= 10^4', 'All strings lowercase, length <= 100'],
        sampleInput: '5\nINSERT apple\nINSERT app\nSEARCH app\nSEARCH ap\nPREFIX ap',
        sampleOutput: 'YES\nNO\nYES',
        solutionApproach: 'TrieNode with children[26] and isEnd flag. Insert: traverse/create nodes. Search: traverse and check isEnd. Prefix: traverse without isEnd check.',
        timeComplexity: 'O(L) per operation where L is string length',
        spaceComplexity: 'O(total characters inserted)',
        difficulty: 'Hard',
        tags: ['trie', 'insert', 'search', 'prefix'],
        javaStarterCode: `import java.util.Scanner;

public class TrieImpl {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEnd = false;
    }

    static TrieNode root = new TrieNode();

    static void insert(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (cur.children[idx] == null) cur.children[idx] = new TrieNode();
            cur = cur.children[idx];
        }
        cur.isEnd = true; // TODO: mark end of word
    }

    static boolean search(String word) {
        TrieNode cur = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            // TODO: if child doesn't exist, return false
            cur = cur.children[idx];
        }
        return cur != null && cur.isEnd; // TODO: must be end of word
    }

    static boolean startsWith(String prefix) {
        TrieNode cur = root;
        for (char c : prefix.toCharArray()) {
            int idx = c - 'a';
            // TODO: if child doesn't exist, return false
            cur = cur.children[idx];
        }
        return cur != null; // any node existing means prefix is present
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int q = sc.nextInt(); sc.nextLine();
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            String[] parts = sc.nextLine().split(" ");
            String op = parts[0], word = parts[1];
            if (op.equals("INSERT")) insert(word);
            else if (op.equals("SEARCH"))  sb.append(search(word) ? "YES" : "NO").append('\n');
            else if (op.equals("PREFIX"))  sb.append(startsWith(word) ? "YES" : "NO").append('\n');
        }
        System.out.print(sb);
    }
}`,
        testCases: [
            { input: '5\nINSERT apple\nINSERT app\nSEARCH app\nSEARCH ap\nPREFIX ap', expectedOutput: 'YES\nNO\nYES', isHidden: false },
            { input: '3\nINSERT cat\nSEARCH dog\nPREFIX ca', expectedOutput: 'NO\nYES', isHidden: false },
        ],
        hints: [
            'search() must check isEnd; startsWith() does NOT check isEnd.',
            'If children[idx] is null during traversal, return false immediately.',
        ],
    },

    // 14.2 Greedy Algorithms
    {
        moduleOrder: 14, topicOrder: 2,
        hasCoding: true,
        title: 'Activity Selection Problem',
        description: 'Select the maximum number of non-overlapping activities using greedy as taught in Kunal\'s greedy video.',
        problemStatement: 'Given N activities with start and end times, select the maximum number of non-overlapping activities.',
        inputFormat: 'First line: N. Next N lines: start end (time intervals).',
        outputFormat: 'Maximum number of non-overlapping activities.',
        constraints: ['1 <= N <= 10^5', '0 <= start < end <= 10^9'],
        sampleInput: '6\n1 4\n3 5\n0 6\n5 7\n3 9\n5 9',
        sampleOutput: '3',
        solutionApproach: 'Sort by end time. Greedily select activity if start >= end time of last selected activity.',
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Hard',
        tags: ['greedy', 'activity-selection', 'interval-scheduling'],
        javaStarterCode: `import java.util.*;

public class ActivitySelection {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] activities = new int[n][2];
        for (int i = 0; i < n; i++) {
            activities[i][0] = sc.nextInt(); // start
            activities[i][1] = sc.nextInt(); // end
        }

        // TODO: Sort activities by end time (activities[i][1])
        // TODO: Select first activity; track lastEnd
        // TODO: For each subsequent activity: if start >= lastEnd, select it, update lastEnd

        System.out.println(0); // replace with count
    }
}`,
        testCases: [
            { input: '6\n1 4\n3 5\n0 6\n5 7\n3 9\n5 9', expectedOutput: '3', isHidden: false },
            { input: '3\n1 2\n2 3\n3 4', expectedOutput: '3', isHidden: false },
            { input: '4\n1 10\n2 3\n3 4\n4 5', expectedOutput: '3', isHidden: true },
        ],
        hints: [
            'Sort by END time, not start time.',
            'Earliest-finish-first maximises the number of non-overlapping activities.',
        ],
    },

    // 14.3 Segment Trees
    {
        moduleOrder: 14, topicOrder: 3,
        hasCoding: true,
        title: 'Range Sum Query with Point Update (Segment Tree)',
        description: 'Build a segment tree for range sum queries and point updates as taught in Kunal\'s segment tree video.',
        problemStatement: 'Given an array of N integers, process Q queries: UPDATE i x (set arr[i]=x) or QUERY l r (print sum of arr[l..r]).',
        inputFormat: 'First line: N. Second line: N integers. Third line: Q. Next Q lines: query.',
        outputFormat: 'Output of each QUERY on a separate line.',
        constraints: ['1 <= N, Q <= 10^5', '-10^9 <= arr[i], x <= 10^9', '0-indexed'],
        sampleInput: '5\n1 3 5 7 9\n3\nQUERY 1 3\nUPDATE 2 10\nQUERY 1 3',
        sampleOutput: '15\n20',
        solutionApproach: 'Build segment tree with O(N). Update in O(log N). Query in O(log N) by combining relevant nodes.',
        timeComplexity: 'O(N + Q log N)',
        spaceComplexity: 'O(N)',
        difficulty: 'Hard',
        tags: ['segment-tree', 'range-query', 'point-update'],
        javaStarterCode: `import java.util.*;

public class SegmentTree {
    static long[] tree;
    static int n;

    static void build(int[] arr, int node, int start, int end) {
        if (start == end) {
            tree[node] = arr[start];
        } else {
            int mid = (start + end) / 2;
            build(arr, 2*node, start, mid);
            build(arr, 2*node+1, mid+1, end);
            tree[node] = tree[2*node] + tree[2*node+1];
        }
    }

    static void update(int node, int start, int end, int idx, long val) {
        if (start == end) {
            tree[node] = val;
        } else {
            int mid = (start + end) / 2;
            // TODO: recurse left or right based on idx vs mid
            tree[node] = tree[2*node] + tree[2*node+1];
        }
    }

    static long query(int node, int start, int end, int l, int r) {
        if (r < start || end < l) return 0; // out of range
        if (l <= start && end <= r) return tree[node]; // fully covered
        int mid = (start + end) / 2;
        // TODO: return sum of left and right child queries
        return 0; // replace
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        tree = new long[4 * n];
        build(arr, 1, 0, n-1);
        int q = sc.nextInt(); sc.nextLine();
        StringBuilder sb = new StringBuilder();
        while (q-- > 0) {
            String[] parts = sc.nextLine().split(" ");
            if (parts[0].equals("UPDATE")) {
                update(1, 0, n-1, Integer.parseInt(parts[1]), Long.parseLong(parts[2]));
            } else {
                sb.append(query(1, 0, n-1, Integer.parseInt(parts[1]), Integer.parseInt(parts[2]))).append('\n');
            }
        }
        System.out.print(sb);
    }
}`,
        testCases: [
            { input: '5\n1 3 5 7 9\n3\nQUERY 1 3\nUPDATE 2 10\nQUERY 1 3', expectedOutput: '15\n20', isHidden: false },
            { input: '3\n1 2 3\n1\nQUERY 0 2', expectedOutput: '6', isHidden: false },
        ],
        hints: [
            'Segment tree uses 1-based node indexing: left child = 2*node, right = 2*node+1.',
            'Allocate tree array of size 4*N to be safe.',
        ],
    },

    // 14.4 Mo's Algorithm
    {
        moduleOrder: 14, topicOrder: 4,
        hasCoding: true,
        title: 'Distinct Elements in Range (Mo\'s Algorithm)',
        description: 'Count distinct elements in multiple ranges using Mo\'s algorithm as taught in Kunal\'s Mo\'s algorithm video.',
        problemStatement: 'Given an array of N integers and Q queries [l, r], print the count of distinct elements in each range.',
        inputFormat: 'First line: N. Second line: N integers. Third line: Q. Next Q lines: l r.',
        outputFormat: 'Q lines — distinct count for each query.',
        constraints: ['1 <= N, Q <= 5×10^4', '0 <= arr[i] <= 10^6', '0-indexed queries'],
        sampleInput: '6\n1 2 3 2 1 3\n3\n0 5\n1 3\n2 4',
        sampleOutput: '3\n3\n3',
        solutionApproach: 'Sort queries by (block, R). Expand/shrink window maintaining freq[] and distinctCount. Answer queries in sorted order, output in original order.',
        timeComplexity: 'O((N+Q)√N)',
        spaceComplexity: 'O(N + Q)',
        difficulty: 'Hard',
        tags: ["Mo's", 'offline', 'distinct-count', 'sqrt-decomposition'],
        javaStarterCode: `import java.util.*;

public class MosAlgorithm {
    static int[] freq;
    static int distinctCount = 0;

    static void add(int[] arr, int pos) {
        if (freq[arr[pos]] == 0) distinctCount++;
        freq[arr[pos]]++;
    }

    static void remove(int[] arr, int pos) {
        freq[arr[pos]]--;
        if (freq[arr[pos]] == 0) distinctCount--;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        int q = sc.nextInt();
        int[][] queries = new int[q][3]; // [l, r, originalIndex]
        for (int i = 0; i < q; i++) {
            queries[i][0] = sc.nextInt();
            queries[i][1] = sc.nextInt();
            queries[i][2] = i;
        }

        int block = (int) Math.sqrt(n);
        // TODO: Sort queries: primary = queries[i][0]/block, secondary = queries[i][1]
        //       (For odd blocks, sort R descending for better cache behaviour)
        Arrays.sort(queries, (a, b) -> {
            int ba = a[0] / block, bb = b[0] / block;
            if (ba != bb) return ba - bb;
            return (ba % 2 == 0) ? a[1] - b[1] : b[1] - a[1];
        });

        freq = new int[1_000_001];
        int[] answers = new int[q];
        int curL = 0, curR = -1;

        for (int[] query : queries) {
            int l = query[0], r = query[1], idx = query[2];
            // TODO: Expand/shrink curR to r
            while (curR < r) add(arr, ++curR);
            // TODO: Expand/shrink curL to l
            while (curL > l) add(arr, --curL);
            while (curR > r) remove(arr, curR--);
            while (curL < l) remove(arr, curL++);
            answers[idx] = distinctCount;
        }

        StringBuilder sb = new StringBuilder();
        for (int ans : answers) sb.append(ans).append('\n');
        System.out.print(sb);
    }
}`,
        testCases: [
            { input: '6\n1 2 3 2 1 3\n3\n0 5\n1 3\n2 4', expectedOutput: '3\n3\n3', isHidden: false },
            { input: '4\n1 1 2 2\n2\n0 3\n0 1', expectedOutput: '2\n1', isHidden: false },
        ],
        hints: [
            'Block size = (int)Math.sqrt(n) balances cost between sorting and pointer movement.',
            'add() increments freq; if it was 0, increment distinctCount. remove() is the reverse.',
        ],
    },

]; // ← closes the codingProblems array

const normalizedModules = normalizeSeedValue(modules);
const normalizedTopics = normalizeSeedValue(topics);
const normalizedMcqs = normalizeSeedValue(mcqs);
const normalizedCodingProblems = normalizeSeedValue(codingProblems);
const normalizedModuleLevelByOrder = Object.fromEntries(
    normalizedModules.map((module) => [module.order, module.courseLevel || 'Beginner'])
);

const validateSeedCoverage = () => {
    const topicKeys = new Set(normalizedTopics.map((topic) => `${topic.moduleOrder}_${topic.order}`));
    const mcqKeys = new Set(normalizedMcqs.map((mcq) => `${mcq.moduleOrder}_${mcq.topicOrder}`));
    const codingKeys = new Set(
        normalizedCodingProblems.map((problem) => `${problem.moduleOrder}_${problem.topicOrder}`)
    );
    const mcqCountsByTopic = normalizedMcqs.reduce((acc, mcq) => {
        const key = `${mcq.moduleOrder}_${mcq.topicOrder}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});
    const levelMismatches = normalizedTopics.filter(
        (topic) => (normalizedModuleLevelByOrder[topic.moduleOrder] || 'Beginner') !== topic.courseLevel
    );

    const missingMcqs = [...topicKeys].filter((key) => !mcqKeys.has(key));
    const missingCoding = [...topicKeys].filter((key) => !codingKeys.has(key));
    const insufficientMcqs = [...topicKeys].filter((key) => (mcqCountsByTopic[key] || 0) < 5);

    if (missingMcqs.length > 0 || missingCoding.length > 0 || insufficientMcqs.length > 0 || levelMismatches.length > 0) {
        throw new Error(
            [
                'Seed coverage validation failed.',
                missingMcqs.length > 0
                    ? `Missing MCQs for: ${missingMcqs.join(', ')}`
                    : null,
                missingCoding.length > 0
                    ? `Missing coding problems for: ${missingCoding.join(', ')}`
                    : null,
                insufficientMcqs.length > 0
                    ? `Topics with fewer than 5 MCQs: ${insufficientMcqs.join(', ')}`
                    : null,
                levelMismatches.length > 0
                    ? `Topic level mismatches: ${levelMismatches.map((topic) => `${topic.moduleOrder}_${topic.order}`).join(', ')}`
                    : null,
            ]
                .filter(Boolean)
                .join(' ')
        );
    }
};
async function seed() {
    section('Connecting to MongoDB');
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    log('Connected');
    validateSeedCoverage();
    log(`Seed coverage verified for ${normalizedTopics.length} topics`);

    const fresh = process.argv.includes('--fresh');

    if (fresh) {
        section('Dropping existing data (--fresh)');
        await Module.deleteMany({}); log('Modules cleared');
        await Topic.deleteMany({}); log('Topics cleared');
        await MCQ.deleteMany({}); log('MCQs cleared');
        await CodingProblem.deleteMany({}); log('CodingProblems cleared');
        await Progress.deleteMany({}); log('Progress cleared');
        await Roadmap.deleteMany({}); log('Roadmaps cleared');
        await Assessment.deleteMany({}); log('Assessments cleared');
        await PerformanceLog.deleteMany({}); log('Performance logs cleared');
        await User.updateMany(
            {},
            {
                $set: {
                    activeRoadmap: null,
                    roadmapGenerated: false,
                    placementReadiness: 0,
                    totalProblemsSolved: 0,
                    totalMCQAttempted: 0,
                    totalMCQCorrect: 0,
                    watchedVideos: [],
                    topicsMastered: [],
                },
            }
        );
        log('User curriculum-bound fields reset');
    }

   
    section('Inserting/Updating Modules');
    const moduleOps = normalizedModules.map(m => ({
        updateOne: {
            filter: { order: m.order },
            update: {
                $set: {
                    order: m.order,
                    title: m.title,
                    description: m.description,
                    difficulty: m.courseLevel || 'Beginner',
                    estimatedDays:
                        typeof m.estimatedDays === 'number'
                            ? m.estimatedDays
                            : (m.courseLevel === 'Advanced' ? 7 : (m.courseLevel === 'Intermediate' ? 5 : 4)),
                }
            },
            upsert: true,
        }
    }));
    await Module.bulkWrite(moduleOps);
    log(`${normalizedModules.length} modules upserted`);
    
    // Fetch all modules for mapping
    const insertedModules = await Module.find({}).sort({ order: 1 });

    // Build order → ObjectId map for modules
    const moduleMap = {};
    insertedModules.forEach(m => { moduleMap[m.order] = m._id; });
    const codingTopicMap = new Map(
        normalizedCodingProblems.map((problem) => [
            `${problem.moduleOrder}_${problem.topicOrder}`,
            problem.hasCoding !== false,
        ])
    );

    // -------------------- Insert/Update Topics --------------------
    section('Inserting/Updating Topics');
    const topicOps = normalizedTopics.map(t => {
        const topicKey = `${t.moduleOrder}_${t.order}`;
        const resolvedCourseLevel = normalizedModuleLevelByOrder[t.moduleOrder] || 'Beginner';
        const durationMinutes = Number(t.videoDuration) || 0;
        const hasCoding = codingTopicMap.get(topicKey) !== false;
        const moduleId = moduleMap[t.moduleOrder];

        return {
            updateOne: {
                filter: { moduleId, order: t.order },
                update: {
                    $set: {
                        moduleId,
                        order: t.order,
                        title: t.title,
                        description: t.description || t.title,
                        videoUrl: t.videoUrl,
                        videoTitle: t.videoTitle,
                        videoDuration: durationMinutes,
                        estimatedMinutes: durationMinutes,
                        difficultyLevel: t.difficultyLevel,
                        courseLevel: resolvedCourseLevel,
                        javaConceptTags: t.javaConceptTags || [],
                        learningAssets: buildLearningAssets(t, hasCoding),
                    }
                },
                upsert: true,
            }
        };
    });
    await Topic.bulkWrite(topicOps);
    log(`${normalizedTopics.length} topics upserted`);

    // Fetch all topics for mapping
    const insertedTopics = await Topic.find({}).sort({ moduleId: 1, order: 1 });

    // Build (moduleOrder, topicOrder) → ObjectId map for topics
    const topicMap = {};
    insertedTopics.forEach((t, index) => {
        const sourceTopic = normalizedTopics[index];
        if (sourceTopic) {
            topicMap[`${sourceTopic.moduleOrder}_${sourceTopic.order}`] = t._id;
        }
    });

    // Update each Module's totalTopics and topics array
    section('Updating Module topic references');
    for (const mod of insertedModules) {
        const moduleTopics = insertedTopics
            .filter(t => String(t.moduleId) === String(mod._id))
            .map(t => t._id);
        await Module.findByIdAndUpdate(mod._id, {
            totalTopics: moduleTopics.length,
            topics: moduleTopics,
        });
    }
    log('Module topic references updated');

    
    section('Inserting/Updating MCQs');
    const mcqDocs = normalizedMcqs.map((q, index) => ({
        seedIndex: index,
        topicId: topicMap[`${q.moduleOrder}_${q.topicOrder}`],
        moduleId: moduleMap[q.moduleOrder],
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        questionType: q.questionType,
        tags: q.tags || [],
    }));
    const invalidMCQs = mcqDocs.filter(doc => !doc.topicId || !doc.moduleId);
    if (invalidMCQs.length > 0) {
        console.warn(`  ! Skipping ${invalidMCQs.length} MCQ(s) with invalid module/topic mapping`);
        invalidMCQs.slice(0, 5).forEach(doc => {
            console.warn(
                `    - MCQ #${doc.seedIndex}`
            );
        });
    }
    const validMCQDocs = mcqDocs
        .filter(doc => doc.topicId && doc.moduleId)
        .map(({ seedIndex, ...doc }) => doc);
    
    const mcqOps = validMCQDocs.map(doc => ({
        updateOne: {
            filter: {
                topicId: doc.topicId,
                question: doc.question,
            },
            update: { $set: doc },
            upsert: true,
        }
    }));
    if (mcqOps.length > 0) {
        await MCQ.bulkWrite(mcqOps);
    }
    log(`${validMCQDocs.length} MCQs upserted`);

    
    section('Inserting/Updating Coding Problems');
    const cpDocs = normalizedCodingProblems.map(cp => {
        const topicId = topicMap[`${cp.moduleOrder}_${cp.topicOrder}`];
        const moduleId = moduleMap[cp.moduleOrder];
        if (cp.hasCoding === false) {
            return {
                topicId,
                moduleId,
                hasCoding: false,
                title: cp.title,
                description: cp.description,
                difficulty: cp.difficulty === 'Basic' ? 'Easy' : (cp.difficulty || 'Easy'),
                tags: cp.tags || [],
            };
        }
        return {
            topicId,
            moduleId,
            hasCoding: true,
            title: cp.title,
            description: cp.description,
            problemStatement: cp.problemStatement,
            inputFormat: cp.inputFormat,
            outputFormat: cp.outputFormat,
            constraints: Array.isArray(cp.constraints) ? cp.constraints.join('\n') : (cp.constraints || ''),
            sampleInput: cp.sampleInput,
            sampleOutput: cp.sampleOutput,
            solutionApproach: cp.solutionApproach,
            timeComplexity: cp.timeComplexity,
            spaceComplexity: cp.spaceComplexity,
            difficulty: cp.difficulty === 'Basic' ? 'Easy' : (cp.difficulty || 'Easy'),
            javaStarterCode: cp.javaStarterCode,
            testCases: cp.testCases || [],
            hints: cp.hints || [],
            tags: cp.tags || [],
        };
    });
    
    const cpOps = cpDocs.map(doc => ({
        updateOne: {
            filter: {
                topicId: doc.topicId,
                title: doc.title,
            },
            update: { $set: doc },
            upsert: true,
        }
    }));
    if (cpOps.length > 0) {
        await CodingProblem.bulkWrite(cpOps);
    }
    log(`${cpDocs.length} coding problems upserted`);

    
    section('Seed Complete – Final Counts');
    log(`Modules:         ${await Module.countDocuments()}`);
    log(`Topics:          ${await Topic.countDocuments()}`);
    log(`MCQs:            ${await MCQ.countDocuments()}`);
    log(`CodingProblems:  ${await CodingProblem.countDocuments()}`);

    await mongoose.disconnect();
    log('Disconnected from MongoDB');
}


seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});