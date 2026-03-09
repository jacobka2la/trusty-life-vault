import logoBlue from '@/assets/logo-blue.png';

interface LogoProps {
  className?: string;
}

const Logo = ({ className = 'h-7 w-7' }: LogoProps) => (
  <img src={logoBlue} alt="DocuVault" className={className} />
);

export default Logo;
