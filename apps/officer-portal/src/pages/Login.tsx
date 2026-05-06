import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, token, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-border/50 shadow-2xl shadow-primary/5">
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">Nirṇay</h1>
                <p className="text-sm text-muted-foreground mt-1">Officer Portal</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Secure access for government procurement officers. Your session is encrypted and audit-logged.
                </p>
              </div>

              {!import.meta.env.VITE_FIREBASE_API_KEY && (
                <div className="p-3 text-xs text-destructive-foreground bg-destructive rounded-lg border border-destructive/50 font-medium">
                  Missing Firebase Configuration. Please add VITE_FIREBASE_API_KEY and other credentials to your .env file.
                </div>
              )}

              <Button
                className="w-full h-12 text-base gap-3"
                onClick={signInWithGoogle}
                disabled={loading || !import.meta.env.VITE_FIREBASE_API_KEY}
              >
                Sign in with Google
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-[11px] text-center text-muted-foreground">
              By signing in, you agree to the Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;
