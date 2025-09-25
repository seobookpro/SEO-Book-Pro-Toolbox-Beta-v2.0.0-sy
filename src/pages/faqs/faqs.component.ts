import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faqs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqsComponent {
  searchTerm = signal('');
  
  faqs = signal<FaqItem[]>([
    { question: 'What is technical SEO?', answer: 'Technical SEO refers to website and server optimizations that help search engine spiders crawl and index your site more effectively (to help improve organic rankings).', open: false },
    { question: 'Why is site speed important for SEO?', answer: 'Site speed is a critical ranking factor for Google. A faster site provides a better user experience, which can lead to higher engagement, conversions, and rankings.', open: false },
    { question: 'What is a canonical tag?', answer: 'A canonical tag (rel="canonical") is a way of telling search engines that a specific URL represents the master copy of a page. Using it prevents problems caused by identical or "duplicate" content appearing on multiple URLs.', open: false },
    { question: 'What is a robots.txt file?', answer: 'A robots.txt file tells search engine crawlers which pages or files the crawler can or can\'t request from your site. It\'s used mainly to avoid overloading your site with requests.', open: false },
    { question: 'What is structured data (JSON-LD)?', answer: 'Structured data is a standardized format for providing information about a page and classifying the page content. JSON-LD is the recommended format by Google. It can help your site appear in rich results in search.', open: false },
    { question: 'What is structured data (JSON-LD)?', answer: 'Structured data is a standardized format for providing information about a page and classifying the page content. JSON-LD is the recommended format by Google. It can help your site appear in rich results in search.', open: false },
  ]);

  filteredFaqs = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.faqs();
    }
    return this.faqs().filter(
      faq => faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)
    );
  });

  toggleFaq(index: number) {
    this.faqs.update(currentFaqs => {
      const newFaqs = [...currentFaqs];
      // Note: We need to find the original index if filtered
      const originalIndex = currentFaqs.findIndex(faq => faq.question === this.filteredFaqs()[index].question);
      if (originalIndex !== -1) {
        newFaqs[originalIndex] = { ...newFaqs[originalIndex], open: !newFaqs[originalIndex].open };
      }
      return newFaqs;
    });
  }
}