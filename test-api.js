const API = 'http://localhost:4000/api';
const adminSecret = 'ta-secret-2026';

async function test() {
  try {
    // 1. Get subjects
    console.log('Fetching subjects...');
    const resSubjects = await fetch(`${API}/subjects`);
    const subjects = await resSubjects.json();
    console.log(`Found ${subjects.length} subjects.`);

    let subject = subjects[0];
    if (!subject) {
      console.log('Creating a subject...');
      const resCreateSubj = await fetch(`${API}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          code: 'TEST101',
          name: 'Test Subject',
          semester: '2026/1',
          isActive: true,
        }),
      });
      if (!resCreateSubj.ok) {
        throw new Error(`Failed to create subject: ${await resCreateSubj.text()}`);
      }
      subject = await resCreateSubj.json();
      console.log('Created subject:', subject);
    }

    // 2. Create lab
    console.log('Creating a lab under subject:', subject._id);
    const resCreateLab = await fetch(`${API}/labs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret,
      },
      body: JSON.stringify({
        subjectId: subject._id,
        name: 'Test Lab 1',
        order: 1,
        checkpoints: [
          { name: 'CP1', order: 0 },
          { name: 'CP2', order: 1 }
        ],
        isActive: true,
      }),
    });

    if (!resCreateLab.ok) {
      throw new Error(`Failed to create lab: ${await resCreateLab.text()}`);
    }
    const lab = await resCreateLab.json();
    console.log('Successfully created lab:', lab);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
