import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

const bootstrapPromise = bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(BrowserModule), provideAnimations()],
});

// Logging bootstrap information
bootstrapPromise
  .then(() => console.log(`Bootstrap success`))
  .catch((err) => console.error(err));
