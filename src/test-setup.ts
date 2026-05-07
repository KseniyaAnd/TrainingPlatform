import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { beforeAll, beforeEach } from 'vitest';
import 'zone.js';
import 'zone.js/testing';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock atob for JWT parsing
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// Initialize Angular testing environment
beforeAll(() => {
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
});

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  // Reset TestBed
  TestBed.resetTestingModule();
});
