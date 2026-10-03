import { HomeScreen } from '../../components/nutrition-intelligence/home/HomeScreen';
import { STARTER_PROMPTS, TRY_PROMPTS } from '../../lib/nutrition-intelligence/mock-data';

// TODO(api): replace the sample prompts with your own.
export default function HomePage() {
  return <HomeScreen prompts={STARTER_PROMPTS} tryPrompts={TRY_PROMPTS} />;
}
