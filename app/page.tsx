"use client";

import { useDimaApp } from "@/controllers/useDimaApp";
import { DimaAppView } from "@/views/DimaAppView";
import { LoginView } from "@/views/LoginView";
import { SplashScreen } from "@/views/SplashScreen";

export default function HomePage() {
  const c = useDimaApp();

  if (!c.ready) {
    return <SplashScreen />;
  }

  if (!c.sessionActive) {
    return (
      <LoginView
        t={c.t}
        isRTL={c.isRTL}
        lang={c.lang}
        setLang={c.setLang}
        signIn={c.signIn}
        signUp={c.signUp}
        signInWithGoogle={c.signInWithGoogle}
        googleProfilePending={c.googleProfilePending}
        completeGoogleProfile={c.completeGoogleProfile}
        cancelGoogleProfile={c.cancelGoogleProfile}
        authError={c.authError}
        firebaseConfigured={c.firebaseConfigured}
        pendingEmailVerification={c.pendingEmailVerification}
        resendEmailVerification={c.resendEmailVerification}
        reloadAuthUser={c.reloadAuthUser}
        sendPasswordReset={c.sendPasswordReset}
        logout={c.logout}
      />
    );
  }

  if (!c.userUid) {
    return <SplashScreen />;
  }

  return (
    <DimaAppView
      role={c.role}
      userUid={c.userUid}
      userEmail={c.userEmail}
      lang={c.lang}
      setLang={c.setLang}
      activeTab={c.activeTab}
      setActiveTab={c.setActiveTab}
      events={c.events}
      isRTL={c.isRTL}
      t={c.t}
      logout={c.logout}
    />
  );
}
