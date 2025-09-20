import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SEO_GLOSSARY_DATA } from '../../data/seo-glossary.data';

@Component({
  selector: 'app-seo-glossary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seo-glossary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoGlossaryComponent {
  private fullGlossary = signal(SEO_GLOSSARY_DATA);
  openAccordion = signal<string | null>(null);
  searchTerm = signal('');

  private slugToLetterMap = new Map<string, string>();

  constructor() {
    // Populate map for quick lookups when scrolling to a term
    const glossaryData = SEO_GLOSSARY_DATA;
    for (const letter in glossaryData) {
      if (Object.prototype.hasOwnProperty.call(glossaryData, letter)) {
        glossaryData[letter].forEach(item => {
          this.slugToLetterMap.set(this.slugify(item.term), letter);
        });
      }
    }
  }

  // Filter based on search term
  private filteredGlossary = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const glossaryData = this.fullGlossary();
    
    if (!term) {
      return glossaryData;
    }

    const filtered: { [key: string]: { term: string; definition: string }[] } = {};

    for (const letter in glossaryData) {
      if (Object.prototype.hasOwnProperty.call(glossaryData, letter)) {
        const matchingItems = glossaryData[letter].filter(
          item => 
            item.term.toLowerCase().includes(term) || 
            item.definition.toLowerCase().includes(term)
        );
        
        if (matchingItems.length > 0) {
          filtered[letter] = matchingItems;
        }
      }
    }
    return filtered;
  });

  // All terms for linking, sorted by length descending to match longer phrases first
  private allTerms = computed(() => {
    const glossary = this.fullGlossary();
    const terms: { term: string; slug: string }[] = [];
    for (const letter in glossary) {
      glossary[letter].forEach(item => {
        terms.push({ term: item.term, slug: this.slugify(item.term) });
      });
    }
    return terms.sort((a, b) => b.term.length - a.term.length);
  });
  
  // The main data source for the template, with linked definitions
  processedGlossary = computed(() => {
    const filtered = this.filteredGlossary();
    const allTermsForLinking = this.allTerms();
    const processed: { [key: string]: { term: string; definition: string; slug: string; linkedDefinition: string }[] } = {};

    for (const letter in filtered) {
      processed[letter] = filtered[letter].map(item => {
        const slug = this.slugify(item.term);
        return {
          ...item,
          slug: slug,
          linkedDefinition: this.linkifyDefinition(item.definition, item.term, allTermsForLinking)
        };
      });
    }
    return processed;
  });

  alphabet = computed(() => Object.keys(this.processedGlossary()));

  private slugify(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, '') // remove non-word chars
      .trim()
      .replace(/[\s_-]+/g, '-'); // collapse whitespace and underscores to a single dash
  }
  
  private linkifyDefinition(definition: string, currentTerm: string, allTerms: {term: string, slug: string}[]): string {
    let linkedDefinition = definition;
    allTerms.forEach(termToLink => {
      if (termToLink.term.toLowerCase() === currentTerm.toLowerCase()) {
        return; // Don't link a term to itself
      }
      
      const escapedTerm = termToLink.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      
      if (regex.test(linkedDefinition)) {
        linkedDefinition = linkedDefinition.replace(regex,
          `<a href="#/seo-glossary#term-${termToLink.slug}" 
              data-term-slug="${termToLink.slug}"
              class="text-orange-600 dark:text-orange-400 hover:underline font-semibold">$&</a>`
        );
      }
    });
    return linkedDefinition;
  }

  handleLinkClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'A' && target.dataset['termSlug']) {
      event.preventDefault();
      const slug = target.dataset['termSlug'];
      this.scrollToTerm(slug);
    }
  }

  private scrollToTerm(slug: string) {
    const letter = this.slugToLetterMap.get(slug);
    if (letter) {
      this.openAccordion.set(letter);
      // Wait for the accordion to open in the DOM before scrolling
      setTimeout(() => {
        const element = document.getElementById(`term-${slug}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  toggleAccordion(letter: string) {
    this.openAccordion.update(current => current === letter ? null : letter);
  }
}