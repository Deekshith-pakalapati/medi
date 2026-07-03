import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const usePushNotifications = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isSignedIn) return;

    const registerAndSubscribe = async () => {
      try {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          let subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });
          }

          const token = await getToken();
          if (token && subscription) {
            await fetch(`${import.meta.env.VITE_API_URL}/notifications/subscribe`, {
              method: 'POST',
              body: JSON.stringify(subscription),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            });
          }
        }
      } catch (error) {
        console.error('Error during service worker registration or push subscription:', error);
      }
    };

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          registerAndSubscribe();
        }
      });
    } else if (Notification.permission === 'granted') {
      registerAndSubscribe();
    }
  }, [isSignedIn, getToken]);
};
