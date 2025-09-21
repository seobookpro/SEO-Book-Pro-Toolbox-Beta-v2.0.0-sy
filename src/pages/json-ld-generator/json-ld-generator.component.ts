import { Component, ChangeDetectionStrategy, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type SchemaType = 'Article' | 'BreadcrumbList' | 'Course' | 'Dataset' | 'DiscussionForumPosting' | 'Event' | 'FAQPage' | 'ImageObject' | 'JobPosting' | 'LocalBusiness' | 'Movie' | 'Organization' | 'Product' | 'ProfilePage' | 'QAPage' | 'Recipe' | 'Review' | 'SoftwareApplication' | 'VacationRental' | 'VideoObject';

// Define types for the signal objects to get strong typing on keys
type Article = { headline: string; image: string; datePublished: string; authorName: string; isPaywalled: boolean; speakableCssSelector: string; };
type Product = { name: string; image: string; description: string; sku: string; brandName: string; currency: string; price: string; };
type Faq = { question: string; answer: string; };
type LocalBusiness = { name: string; address: string; telephone: string; priceRange: string; };
type BreadcrumbItem = { name: string; item: string; };
type Course = { name: string; description: string; providerName: string; };
type Dataset = { name: string; description: string; url: string; };
type DiscussionForumPosting = { headline: string; authorName: string; text: string; };
type Event = { name: string; startDate: string; endDate: string; locationName: string; locationAddress: string; };
type ImageObject = { name: string; contentUrl: string; author: string; license: string; };
type JobPosting = { title: string; description: string; hiringOrganizationName: string; jobLocation: string; baseSalary: string; currency: string; };
type Movie = { name: string; directorName: string; dateCreated: string; image: string; };
type Organization = { name: string; url: string; logo: string; aggregateRating: string; ratingCount: string; };
type ProfilePage = { mainEntityName: string; mainEntityJobTitle: string; mainEntityImage: string; };
type QAPage = { questionName: string; answerText: string; };
type Recipe = { name: string; description: string; prepTime: string; cookTime: string; recipeIngredient: string; };
type Review = { itemName: string; authorName: string; reviewRatingValue: string; bestRating: string; worstRating: string; };
type SoftwareApplication = { name: string; operatingSystem: string; applicationCategory: string; ratingValue: string; ratingCount: string; };
type VideoObject = { name: string; description: string; uploadDate: string; thumbnailUrl: string; contentUrl: string; };
type VacationRental = { name: string; description: string; image: string; address: string; };

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
  article = signal<Article>({ headline: '', image: '', datePublished: '', authorName: '', isPaywalled: false, speakableCssSelector: '' });
  product = signal<Product>({ name: '', image: '', description: '', sku: '', brandName: '', currency: 'USD', price: '' });
  faqPage = signal<Faq[]>([{ question: '', answer: '' }]);
  localBusiness = signal<LocalBusiness>({ name: '', address: '', telephone: '', priceRange: '$$' });
  breadcrumbList = signal<BreadcrumbItem[]>([{ name: 'Home', item: 'https://example.com' }, { name: 'Category', item: 'https://example.com/category' }]);
  course = signal<Course>({ name: '', description: '', providerName: '' });
  dataset = signal<Dataset>({ name: '', description: '', url: '' });
  discussionForumPosting = signal<DiscussionForumPosting>({ headline: '', authorName: '', text: '' });
  event = signal<Event>({ name: '', startDate: '', endDate: '', locationName: '', locationAddress: '' });
  imageObject = signal<ImageObject>({ name: '', contentUrl: '', author: '', license: '' });
  jobPosting = signal<JobPosting>({ title: '', description: '', hiringOrganizationName: '', jobLocation: 'Remote', baseSalary: '', currency: 'USD' });
  movie = signal<Movie>({ name: '', directorName: '', dateCreated: '', image: '' });
  organization = signal<Organization>({ name: '', url: '', logo: '', aggregateRating: '4.5', ratingCount: '100' });
  profilePage = signal<ProfilePage>({ mainEntityName: '', mainEntityJobTitle: '', mainEntityImage: '' });
  qaPage = signal<QAPage>({ questionName: '', answerText: '' });
  recipe = signal<Recipe>({ name: '', description: '', prepTime: 'PT30M', cookTime: 'PT1H', recipeIngredient: '1 cup flour\n1 tsp sugar' });
  review = signal<Review>({ itemName: '', authorName: '', reviewRatingValue: '5', bestRating: '5', worstRating: '1' });
  softwareApplication = signal<SoftwareApplication>({ name: '', operatingSystem: 'iOS, Android', applicationCategory: 'GameApplication', ratingValue: '4.5', ratingCount: '1500' });
  videoObject = signal<VideoObject>({ name: '', description: '', uploadDate: '', thumbnailUrl: '', contentUrl: '' });
  vacationRental = signal<VacationRental>({ name: '', description: '', image: '', address: '' });


  schemaTypes: SchemaType[] = ['Article', 'BreadcrumbList', 'Course', 'Dataset', 'DiscussionForumPosting', 'Event', 'FAQPage', 'ImageObject', 'JobPosting', 'LocalBusiness', 'Movie', 'Organization', 'Product', 'ProfilePage', 'QAPage', 'Recipe', 'Review', 'SoftwareApplication', 'VacationRental', 'VideoObject'];

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
          author: { "@type": "Person", name: articleData.authorName },
          isAccessibleForFree: !articleData.isPaywalled,
        };
        if(articleData.speakableCssSelector) {
            data.speakable = {
                "@type": "SpeakableSpecification",
                cssSelector: [articleData.speakableCssSelector]
            }
        }
        break;
      case 'Product':
        const productData = this.product();
        data = {
          ...data,
          name: productData.name, image: productData.image, description: productData.description, sku: productData.sku,
          brand: { "@type": "Brand", name: productData.brandName },
          offers: { "@type": "Offer", url: window.location.href, priceCurrency: productData.currency, price: productData.price, availability: "https://schema.org/InStock" }
        };
        break;
      case 'FAQPage':
        data.mainEntity = this.faqPage().map(faq => ({
          "@type": "Question", name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer }
        }));
        break;
      case 'LocalBusiness':
        const businessData = this.localBusiness();
        data = { ...data, name: businessData.name, address: { "@type": "PostalAddress", streetAddress: businessData.address }, telephone: businessData.telephone, priceRange: businessData.priceRange };
        break;
      case 'BreadcrumbList':
        data.itemListElement = this.breadcrumbList().map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.item
        }));
        break;
      case 'Course':
        const courseData = this.course();
        data = { ...data, name: courseData.name, description: courseData.description, provider: { "@type": "Organization", name: courseData.providerName } };
        break;
      case 'Dataset':
        data = { ...data, ...this.dataset() };
        break;
      case 'DiscussionForumPosting':
        const discussionData = this.discussionForumPosting();
        data = { ...data, headline: discussionData.headline, author: { "@type": "Person", name: discussionData.authorName }, text: discussionData.text };
        break;
      case 'Event':
        const eventData = this.event();
        data = { ...data, name: eventData.name, startDate: eventData.startDate, endDate: eventData.endDate, location: { "@type": "Place", name: eventData.locationName, address: eventData.locationAddress } };
        break;
      case 'ImageObject':
         const imageData = this.imageObject();
         data = { ...data, name: imageData.name, contentUrl: imageData.contentUrl, author: { "@type": "Person", name: imageData.author }, license: imageData.license };
        break;
      case 'JobPosting':
        const jobData = this.jobPosting();
        data = {
            ...data, title: jobData.title, description: jobData.description,
            hiringOrganization: { "@type": "Organization", name: jobData.hiringOrganizationName },
            jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: jobData.jobLocation } },
            baseSalary: { "@type": "MonetaryAmount", currency: jobData.currency, value: { "@type": "QuantitativeValue", value: jobData.baseSalary, unitText: "YEAR" } }
        };
        break;
      case 'Movie':
        const movieData = this.movie();
        data = { ...data, name: movieData.name, director: { "@type": "Person", name: movieData.directorName }, dateCreated: movieData.dateCreated, image: movieData.image };
        break;
      case 'Organization':
        const orgData = this.organization();
        data = { ...data, name: orgData.name, url: orgData.url, logo: orgData.logo,
            aggregateRating: { "@type": "AggregateRating", ratingValue: orgData.aggregateRating, reviewCount: orgData.ratingCount }
        };
        break;
      case 'ProfilePage':
          const profileData = this.profilePage();
          data = { ...data, mainEntity: { "@type": "Person", name: profileData.mainEntityName, jobTitle: profileData.mainEntityJobTitle, image: profileData.mainEntityImage } };
          break;
      case 'QAPage':
          const qaData = this.qaPage();
          data.mainEntity = { "@type": "Question", name: qaData.questionName, acceptedAnswer: { "@type": "Answer", text: qaData.answerText } };
          break;
      case 'Recipe':
          const recipeData = this.recipe();
          data = { ...data, name: recipeData.name, description: recipeData.description, prepTime: recipeData.prepTime, cookTime: recipeData.cookTime, recipeIngredient: recipeData.recipeIngredient.split('\n').filter(i => i.trim() !== '') };
          break;
      case 'Review':
          const reviewData = this.review();
          data = { ...data, itemReviewed: { "@type": "Thing", name: reviewData.itemName }, author: { "@type": "Person", name: reviewData.authorName }, reviewRating: { "@type": "Rating", ratingValue: reviewData.reviewRatingValue, bestRating: reviewData.bestRating, worstRating: reviewData.worstRating } };
          break;
      case 'SoftwareApplication':
          const appData = this.softwareApplication();
          data = { ...data, name: appData.name, operatingSystem: appData.operatingSystem, applicationCategory: appData.applicationCategory, aggregateRating: { "@type": "AggregateRating", ratingValue: appData.ratingValue, ratingCount: appData.ratingCount } };
          break;
      case 'VacationRental':
          const rentalData = this.vacationRental();
          data = { ...data, name: rentalData.name, description: rentalData.description, image: rentalData.image, address: rentalData.address };
          break;
      case 'VideoObject':
          data = { ...data, ...this.videoObject() };
          break;
    }
    return JSON.stringify(data, null, 2);
  });
  
  // FIX: Changed `signal.WritableSignal` to `WritableSignal` and imported it from '@angular/core'.
  updateField<T>(signal: WritableSignal<T>, field: keyof T, value: any) {
    signal.update(s => ({ ...s, [field]: value }));
  }

  // --- Array-based schema updaters ---

  addFaq() { this.faqPage.update(faqs => [...faqs, { question: '', answer: '' }]); }
  removeFaq(index: number) { this.faqPage.update(faqs => faqs.filter((_, i) => i !== index)); }
  updateFaq(index: number, field: 'question' | 'answer', value: string) {
    this.faqPage.update(faqs => {
      const newFaqs = [...faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return newFaqs;
    });
  }

  addBreadcrumb() { this.breadcrumbList.update(b => [...b, { name: '', item: '' }]); }
  removeBreadcrumb(index: number) { this.breadcrumbList.update(b => b.filter((_, i) => i !== index)); }
  updateBreadcrumb(index: number, field: 'name' | 'item', value: string) {
    this.breadcrumbList.update(b => {
      const newBreadcrumbs = [...b];
      newBreadcrumbs[index] = { ...newBreadcrumbs[index], [field]: value };
      return newBreadcrumbs;
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