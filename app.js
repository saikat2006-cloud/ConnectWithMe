// ─────────────────────────────────────────────────────────────
//  app.js
//  Handles form validation, Firestore CRUD, and UI rendering.
//  Depends on: firebase-config.js (must load first)
// ─────────────────────────────────────────────────────────────

const COLLECTION = 'contacts';   // Firestore collection name

/* ── Helpers ── */

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return date.toLocaleDateString();
}

function showToast(type) {
  const el = document.getElementById('toast-' + type);
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

/* ── Validation ── */

function validate() {
  const name  = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  let ok = true;

  ['name', 'email', 'phone'].forEach(f => {
    document.getElementById(f).classList.remove('err');
    document.getElementById(f + '-err').style.display = 'none';
  });

  if (!name) {
    document.getElementById('name').classList.add('err');
    document.getElementById('name-err').style.display = 'block';
    ok = false;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById('email').classList.add('err');
    document.getElementById('email-err').style.display = 'block';
    ok = false;
  }
  if (!phone || phone.replace(/\D/g, '').length < 7) {
    document.getElementById('phone').classList.add('err');
    document.getElementById('phone-err').style.display = 'block';
    ok = false;
  }

  return ok ? { name, email, phone } : null;
}

/* ── Submit → Firestore ── */

async function submitForm() {
  const vals = validate();
  if (!vals) return;

  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    await db.collection(COLLECTION).add({
      name:      vals.name,
      email:     vals.email,
      phone:     vals.phone,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    ['name', 'email', 'phone'].forEach(f => document.getElementById(f).value = '');
    showToast('success');
  } catch (err) {
    console.error('Firestore write error:', err);
    showToast('error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit';
  }
}

/* ── Delete entry from Firestore ── */

async function deleteEntry(docId) {
  try {
    await db.collection(COLLECTION).doc(docId).delete();
  } catch (err) {
    console.error('Firestore delete error:', err);
    showToast('error');
  }
}

/* ── Real-time listener → render entries ── */

function renderEntries(docs) {
  const el      = document.getElementById('entries');
  const countEl = document.getElementById('count');

  countEl.textContent = docs.length + (docs.length === 1 ? ' entry' : ' entries');

  if (!docs.length) {
    el.innerHTML = '<div class="empty-state">No submissions yet — be the first!</div>';
    return;
  }

  el.innerHTML = docs.map(doc => {
    const d  = doc.data();
    const ts = d.createdAt ? d.createdAt.toDate() : new Date();
    return `
      <div class="entry-card">
        <div class="avatar">${initials(d.name)}</div>
        <div class="entry-info">
          <div class="entry-name">${d.name}</div>
          <div class="entry-details">${d.email} &middot; ${d.phone}</div>
          <div class="entry-ts">${timeAgo(ts)}</div>
        </div>
        <button class="delete-btn" onclick="deleteEntry('${doc.id}')">Remove</button>
      </div>
    `;
  }).join('');
}

/* ── Subscribe to Firestore in real-time ── */

db.collection(COLLECTION)
  .orderBy('createdAt', 'desc')
  .onSnapshot(
    snapshot => renderEntries(snapshot.docs),
    err => {
      console.error('Firestore listen error:', err);
      document.getElementById('entries').innerHTML =
        '<div class="empty-state">Could not connect to database. Check your Firebase config.</div>';
    }
  );
