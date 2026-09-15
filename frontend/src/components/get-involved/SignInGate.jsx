import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';

export default function SignInGate({ t, title, body }) {
  return (
    <div className="card-base p-8 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
        <LogIn size={22} className="text-primary" />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{body}</p>
      <div className="flex flex-col gap-3">
        <Link to="/auth" className="btn-primary justify-center">
          {t('Sign In', 'Ingia')} <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
