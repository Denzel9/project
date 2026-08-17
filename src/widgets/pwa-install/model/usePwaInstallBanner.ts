import { useEffect, useState } from 'react';

import {
  dismissPwaInstall,
  hasPwaInstallPrompt,
  initPwaInstallPrompt,
  isIosDevice,
  isPwaInstallDismissed,
  isPwaStandalone,
  promptPwaInstall,
  subscribePwaInstallPrompt,
} from './pwaInstallPrompt';

export const usePwaInstallBanner = () => {
  const [visible, setVisible] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    initPwaInstallPrompt();

    if (isPwaStandalone() || isPwaInstallDismissed()) {
      return;
    }

    setTimeout(() => {
      setIsIos(isIosDevice());
    }, 0);

    const timeoutId = window.setTimeout(() => {
      setVisible(true);
    }, 0);

    const unsubscribe = subscribePwaInstallPrompt(() => {
      setCanPrompt(hasPwaInstallPrompt());

      if (isPwaStandalone() || isPwaInstallDismissed()) {
        setVisible(false);
      }
    });

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const dismiss = () => {
    dismissPwaInstall();
    setVisible(false);
  };

  const install = async () => {
    await promptPwaInstall();
  };

  return { visible, canPrompt, isIos, dismiss, install };
};
