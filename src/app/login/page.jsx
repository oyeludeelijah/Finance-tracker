import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth.jsx';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

// M3 Dark tokens
const M3 = {
  surface: "#1C1B1F",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",
  primary: "#D0BCFF",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",
  onSurface: "#E6E1E5",
  onSurfaceVariant: "#CAC4D0",
  outline: "#49454F",
};

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        await signUp(email, password);
        toast.success('Account created! Welcome to FinanceAI.');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: M3.surface }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: M3.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-8 font-sans" style={{ background: M3.surface }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] md:max-w-[1000px] flex flex-col md:flex-row overflow-hidden shadow-2xl"
        style={{ 
          background: M3.surfaceContainerHigh, 
          borderRadius: '24px',
          minHeight: '600px',
          border: `1px solid ${M3.outlineAlpha44}`
        }}
      >
        {/* Left Side - Dark Card with Glow (Hidden on Mobile) */}
        <div className="relative w-full md:w-1/2 overflow-hidden flex-col justify-between p-12 hidden md:flex" style={{ background: '#141316' }}>
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
          
          <h1 className="text-[2.5rem] font-medium text-white leading-[1.1] z-10 tracking-tight">
            Take control<br />
            of your financial<br />
            future today.
          </h1>

          {/* Purple Gradient Beams at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2/3 flex items-end justify-center z-0 overflow-hidden opacity-80">
             <div className="absolute bottom-[-10%] left-[10%] w-[20%] h-[80%] bg-gradient-to-t from-[#7C4DFF] to-transparent blur-[20px] mix-blend-screen" />
             <div className="absolute bottom-[-20%] left-[30%] w-[25%] h-[100%] bg-gradient-to-t from-[#651FFF] to-transparent blur-[30px] mix-blend-screen" />
             <div className="absolute bottom-[-5%] left-[50%] w-[15%] h-[70%] bg-gradient-to-t from-[#B388FF] to-transparent blur-[15px] mix-blend-screen" />
             <div className="absolute bottom-[-15%] right-[10%] w-[30%] h-[90%] bg-gradient-to-t from-[#4F378B] to-transparent blur-[40px] mix-blend-screen" />
             {/* Base glow */}
             <div className="absolute bottom-[-20%] left-0 w-full h-[60%] bg-[#7C4DFF] blur-[80px] opacity-40 mix-blend-screen" />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-10 md:px-14 relative" style={{ background: M3.surfaceContainerHigh }}>
          <div className="w-full max-w-[360px] mx-auto">
            {/* Logo */}
            <div className="mb-6 flex items-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: M3.primaryContainer }}
              >
                <span style={{ color: M3.onPrimaryContainer, fontWeight: 700, fontSize: "1.2rem" }}>F</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-[2rem] font-bold mb-1 tracking-tight" style={{ color: M3.onSurface }}>
                {isLogin ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-sm" style={{ color: M3.onSurfaceVariant }}>
                Welcome to FinanceAI — Let's get started
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium block" style={{ color: M3.onSurfaceVariant }}>
                  Your email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl transition-all text-sm"
                  style={{
                    background: M3.surfaceContainerHighest,
                    border: `1px solid ${M3.outline}`,
                    color: M3.onSurface,
                    outline: 'none',
                  }}
                  placeholder="hi@financeai.com"
                  onFocus={(e) => e.target.style.border = `1px solid ${M3.primary}`}
                  onBlur={(e) => e.target.style.border = `1px solid ${M3.outline}`}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium block" style={{ color: M3.onSurfaceVariant }}>
                  {isLogin ? 'Password' : 'Create new password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 rounded-xl transition-all text-sm"
                  style={{
                    background: M3.surfaceContainerHighest,
                    border: `1px solid ${M3.outline}`,
                    color: M3.onSurface,
                    outline: 'none',
                  }}
                  placeholder="**********"
                  onFocus={(e) => e.target.style.border = `1px solid ${M3.primary}`}
                  onBlur={(e) => e.target.style.border = `1px solid ${M3.outline}`}
                  required
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-3.5 px-4 rounded-full text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: M3.primary,
                    color: "#21005D", // M3 onPrimary
                  }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.opacity = '1')}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#21005D" }} />
                  ) : (
                    isLogin ? 'Login to account' : 'Create new account'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-[13px] transition-colors"
                style={{ color: M3.onSurfaceVariant }}
              >
                {isLogin ? "Don't have an account? " : "Already have account? "}
                <span className="font-semibold underline underline-offset-2" style={{ color: M3.primary }}>
                  {isLogin ? 'Sign up' : 'Login'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
