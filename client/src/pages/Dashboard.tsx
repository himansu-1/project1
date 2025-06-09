function Dashboard() {
  function handlePermissionClick() {
    Notification.requestPermission().then((permission) => {
      console.log('Notification permission:', permission);
      if (permission === 'granted') {
        new Notification('Notifications enabled!');
      } else {
        alert('Notifications are blocked. Enable from browser settings.');
      }
    });
  }

  return (
    <div>
      Dashboard
      <button
        onClick={() => handlePermissionClick()}>
        Toast
      </button>
    </div>
  )
}

export default Dashboard