// server/test/api.test.js
const BASE = process.env.BASE_URL || 'http://localhost:5000';
let token = '';
let moduleId = '';
let topicId = '';
let mcqId = '';

const headers = (tok) => ({
  'Content-Type': 'application/json',
  ...(tok && { Authorization: `Bearer ${tok}` }),
});

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
  } catch (err) {
    console.error(`❌ FAIL: ${name} — ${err.message}`);
  }
};

(async () => {
  const email = `runner${Date.now()}@example.com`;

  // 1. Register
  await test('Register new user', async () => {
    const res = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        username: email.split('@')[0],
        email,
        password: 'password123',
      }),
    });
    const json = await res.json();
    if (res.status !== 201 && res.status !== 200) throw new Error(json.message);
    token = json.token;
  });

  // 2. Login
  await test('Login', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ email, password: 'password123' }),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    token = json.token;
  });

  // 3. Get all modules
  await test('Get all modules', async () => {
    const res = await fetch(`${BASE}/api/modules`);
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!Array.isArray(json.data)) throw new Error('No modules array');
    moduleId = json.data[0]._id;
  });

  // 4. Get diagnostic MCQs
  await test('Get diagnostic MCQs', async () => {
    const res = await fetch(`${BASE}/api/mcq/diagnostic`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (json.data.questions.length !== 20) throw new Error('Expected 20 questions');
    mcqId = json.data.questions[0]._id;
  });

  // 5. Submit diagnostic assessment
  await test('Submit diagnostic assessment', async () => {
    const res = await fetch(`${BASE}/api/assessment/diagnostic`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        submissions: [{ mcqId, selectedAnswer: 0, timeTaken: 25 }],
      }),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!json.data.level) throw new Error('No level returned');
  });

  // 5.5. Generate roadmap (since diagnostic doesn't auto-generate)
  await test('Generate roadmap', async () => {
    const res = await fetch(`${BASE}/api/roadmap/generate`, {
      method: 'POST',
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 201 && res.status !== 200) throw new Error(json.message);
    topicId = json.data.roadmap.weeks[0].moduleId; // we'll replace with real topic later
  });

  // 6. Check roadmap exists (GET /api/roadmap)
  await test('Roadmap exists after generation', async () => {
    const res = await fetch(`${BASE}/api/roadmap`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!json.data.roadmap) throw new Error('No roadmap');
  });

  // 7. Get today's tasks from roadmap
  await test('Get today tasks from roadmap', async () => {
    const res = await fetch(`${BASE}/api/roadmap`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!json.data.todayTasks) throw new Error('No todayTasks');
  });

  // 8. Get topics for the first module (to get a real topicId)
  await test('Get Topics by Module (to get topicId)', async () => {
    const res = await fetch(`${BASE}/api/modules/${moduleId}/topics`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!json.data[0]) throw new Error('No topics');
    topicId = json.data[0]._id;
  });

  // 9. Get MCQs for that topic Basic level
  await test('Get MCQs for first topic Basic level', async () => {
    const res = await fetch(`${BASE}/api/mcq/topic/${topicId}/Basic`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!json.data.questions || json.data.questions.length === 0) throw new Error('No questions');
    mcqId = json.data.questions[0]._id;
  });

  // 10. Submit assessment for first topic
  await test('Submit assessment for first topic', async () => {
    const res = await fetch(`${BASE}/api/assessment/submit`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        topicId,
        moduleId,
        round: 'Basic',
        submissions: [{ mcqId, selectedAnswer: 1, timeTaken: 30, hintsUsed: 0 }],
      }),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (typeof json.data.passed !== 'boolean') throw new Error('No pass result');
  });

  // 11. Check progress updated
  await test('Check progress updated', async () => {
    const res = await fetch(`${BASE}/api/progress`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (typeof json.data.overallProgress !== 'number') throw new Error('No overallProgress');
  });

  // 12. Log streak
  await test('Log streak', async () => {
    const res = await fetch(`${BASE}/api/streak/log`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        tasksCompleted: 2,
        minutesSpent: 15,
        topicsStudied: ['Arrays'],
      }),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (typeof json.data.currentStreak !== 'number') throw new Error('No streak');
  });

  // 13. Get streak data
  await test('Get streak data', async () => {
    const res = await fetch(`${BASE}/api/streak`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (!json.data.weeklyActivity) throw new Error('No weeklyActivity');
  });

  // 14. Get user progress overview
  await test('Get user progress overview', async () => {
    const res = await fetch(`${BASE}/api/progress`, {
      headers: headers(token),
    });
    const json = await res.json();
    if (res.status !== 200) throw new Error(json.message);
    if (typeof json.data.overallProgress !== 'number') throw new Error('No overallProgress');
  });

  console.log('\n🎯 Test suite completed.');
})();