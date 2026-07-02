export interface FaqItem {
  readonly question: string;
  readonly answer: readonly string[];
}

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: 'What is Luminy?',
    answer: [
      'Luminy brings your bank and investment accounts together in one place.',
      'You get quantitative-style analytics and AI-powered insights for spending, cash flow, subscriptions, and net worth. That means less time in spreadsheets and fewer apps to check.',
    ],
  },
  {
    question: 'Is Luminy a bank, broker, or financial advisor?',
    answer: [
      'No. Luminy is not a bank, broker-dealer, or registered investment adviser. We do not hold your money or execute trades.',
      'We help you view and understand information you choose to connect. Nothing in the app is personalized financial, legal, or tax advice.',
    ],
  },
  {
    question: 'How does account linking work?',
    answer: [
      'When you connect an institution, you sign in with your provider or an authorized data partner. That is subject to their terms and your consent.',
      'We only access the data needed to show balances, transactions, and insights in Luminy. You can disconnect accounts in the app when you want.',
    ],
  },
  {
    question: 'Is my financial data secure?',
    answer: [
      'We take security seriously. We use industry-standard safeguards, encryption in transit, and strict access limits for our team and partners who need to process data.',
      'No system is perfect. For full detail on how we collect, use, and keep information, read our Privacy Policy and Data Policy.',
    ],
  },
  {
    question: 'What devices can I use Luminy on?',
    answer: [
      'Luminy is built for iPhone and Mac. Download links are on our home page.',
      'Availability can vary by region or App Store timing as we roll out.',
    ],
  },
  {
    question: 'How do I get help or share feedback?',
    answer: [
      'Use Contact us or Suggestions in the footer to copy our support email and paste it into your mail app.',
      'We read every message. We try to reply when we can, but we may not respond to every inquiry right away.',
    ],
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="section faq section--tight" aria-labelledby="faq-heading">
      <div className="container">
        <span className="section__label">FAQ</span>
        <h2 className="section__title" id="faq-heading">
          Questions, answered
        </h2>
        <p className="section__lead">Straight answers about what Luminy is, how linking works, and how to reach us.</p>

        <div className="faq__list">
          {FAQ_ITEMS.map((item, index) => (
            <details key={`${index}-${item.question}`} className="faq__item">
              <summary className="faq__summary">{item.question}</summary>
              <div className="faq__panel">
                <div className="faq__panel-inner">
                  {item.answer.map((para, pi) => (
                    <p key={pi} className="faq__answer">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
