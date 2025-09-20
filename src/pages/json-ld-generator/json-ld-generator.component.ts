import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SchemaType = 'Article' | 'Product' | 'FAQPage' | 'LocalBusiness';

// Define types for the signal objects to get strong typing on keys
type Article = { headline: string; image: string; datePublished: string; authorName: string; };
type Product = { name: string; image: string; description: string; sku: string; brandName: string; currency: string; price: string; };
type Faq = { question: string; answer: string; };
type LocalBusiness = { name: string; address: string; telephone: string; priceRange: string; };


@Component({
  selector: 'app-json-ld-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-ld-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonLdGeneratorComponent {
  selectedSchema = signal<SchemaType>('Article');
  copyButtonText = signal('Copy to Clipboard');
  
  // Form data signals
  article = signal<Article>({ headline: '', image: '', datePublished: '', authorName: '' });
  product = signal<Product>({ name: '', image: '', description: '', sku: '', brandName: '', currency: 'USD', price: '' });
  faqPage = signal<Faq[]>([{ question: '', answer: '' }]);
  localBusiness = signal<LocalBusiness>({ name: '', address: '', telephone: '', priceRange: '$$' });

  schemaTypes: SchemaType[] = ['Article', 'Product', 'FAQPage', 'LocalBusiness'];

  generatedJsonLd = computed(() => {
    const schemaType = this.selectedSchema();
    let data: any = {
      "@context": "https://schema.org",
      "@type": schemaType
    };

    switch (schemaType) {
      case 'Article':
        const articleData = this.article();
        data = {
          ...data,
          headline: articleData.headline,
          image: articleData.image,
          datePublished: articleData.datePublished,
          author: {
            "@type": "Person",
            name: articleData.authorName
          }
        };
        break;
      case 'Product':
        const productData = this.product();
        data = {
          ...data,
          name: productData.name,
          image: productData.image,
          description: productData.description,
          sku: productData.sku,
          brand: {
            "@type": "Brand",
            name: productData.brandName
          },
          offers: {
            "@type": "Offer",
            url: window.location.href,
            priceCurrency: productData.currency,
            price: productData.price,
            availability: "https://schema.org/InStock"
          }
        };
        break;
      case 'FAQPage':
        data.mainEntity = this.faqPage().map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }));
        break;
      case 'LocalBusiness':
        const businessData = this.localBusiness();
        data = {
          ...data,
          name: businessData.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: businessData.address
          },
          telephone: businessData.telephone,
          priceRange: businessData.priceRange
        };
        break;
    }
    return JSON.stringify(data, null, 2);
  });
  
  updateArticle(field: keyof Article, value: string) {
    this.article.update(a => ({ ...a, [field]: value }));
  }

  updateProduct(field: keyof Product, value: string) {
    this.product.update(p => ({ ...p, [field]: value }));
  }

  updateLocalBusiness(field: keyof LocalBusiness, value: string) {
    this.localBusiness.update(b => ({ ...b, [field]: value }));
  }

  addFaq() {
    this.faqPage.update(faqs => [...faqs, { question: '', answer: '' }]);
  }

  removeFaq(index: number) {
    this.faqPage.update(faqs => faqs.filter((_, i) => i !== index));
  }

  updateFaq(index: number, field: 'question' | 'answer', value: string) {
    this.faqPage.update(faqs => {
      const newFaqs = [...faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return newFaqs;
    });
  }
  
  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedJsonLd()).then(() => {
      this.copyButtonText.set('Copied!');
      setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 2000);
    });
  }

  testWithGoogle() {
    const code = this.generatedJsonLd();
    if (code) {
      const encodedCode = encodeURIComponent(code);
      const url = `https://search.google.com/test/rich-results?code=${encodedCode}`;
      window.open(url, '_blank');
    }
  }

  validateOnSchemaOrg() {
    const code = this.generatedJsonLd();
    if (code) {
      const encodedCode = encodeURIComponent(code);
      const url = `https://validator.schema.org/#code=${encodedCode}`;
      window.open(url, '_blank');
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
