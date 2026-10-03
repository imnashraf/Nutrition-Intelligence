import { HomeScreen } from '../../components/nutrition-intelligence/home/HomeScreen';
import { SAMPLE_ACCOUNT_INITIALS, STARTER_PROMPTS } from '../../lib/nutrition-intelligence/mock-data';

// TODO(api): replace the sample prompts / initials with your own data
// (e.g. the signed-in user's initials from your auth session).
export default function HomePage() {
  return <HomeScreen prompts={STARTER_PROMPTS} accountInitials={SAMPLE_ACCOUNT_INITIALS} />;
}
