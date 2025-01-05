import { useEffect, useState } from 'react'

function useIsMobile(initial_breakpoint: number = 768) {

  const MOBILE_BREAKPOINT = initial_breakpoint;
  const [isMobile, setIsMobile] = useState<boolean>(false);


  const handleWindowSizeChange = () => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT ? true : false;
    setIsMobile(isMobile);

};


  useEffect(() => {
    handleWindowSizeChange();
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
        window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);


  return { isMobile }
  
}

export default useIsMobile