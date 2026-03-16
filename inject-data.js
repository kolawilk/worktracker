// This script runs in the browser context
(function() {
  const categories = [
    { id: '1', name: 'Arbeit 💼', emoji: '💼', color: '#3B82F6', createdAt: new Date().toISOString() },
    { id: '2', name: 'Privat 🏠', emoji: '🏠', color: '#10B981', createdAt: new Date().toISOString() },
    { id: '3', name: 'Meeting 📊', emoji: '📊', color: '#8B5CF6', createdAt: new Date().toISOString() }
  ];
  localStorage.setItem('worktracker-categories', JSON.stringify(categories));
  
  const entries = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    entries.push({
      id: 'e' + i,
      categoryId: categories[i % 3].id,
      startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0).toISOString(),
      endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 17, 0).toISOString(),
      date: date.toISOString().split('T')[0]
    });
  }
  localStorage.setItem('worktracker-time-entries', JSON.stringify(entries));
  console.log('LocalStorage set with categories and entries');
  window.localStorageInjected = true;
})();
