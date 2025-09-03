import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const IndexScreen = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return null;  
};

export default IndexScreen;