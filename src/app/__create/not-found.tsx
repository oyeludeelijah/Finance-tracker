import { useNavigate } from 'react-router';

export default function SimpleNotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-5">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
      >
        Go Home
      </button>
    </div>
  );
}
