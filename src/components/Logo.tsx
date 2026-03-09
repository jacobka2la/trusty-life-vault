import logoImg from '@/assets/logo.png';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = 'h-10 w-10' }: LogoProps) => (
  <img src={logoImg} alt="DocuVault" className={`object-contain ${className}`} />
);

export default Logo;
