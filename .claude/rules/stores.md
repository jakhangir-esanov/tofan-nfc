---
paths:
  - "src/app/**/*.store.ts"
---

# Store rules

- One store per screen, `@Injectable()`, provided by the page (`providers: [ScanStore]`).
  Only truly global state (`AuthStore`) is `providedIn: 'root'`.
- The store injects the feature service directly. No repository abstraction, no use-case classes.
- Private writable signals, public readonly views:

```ts
@Injectable()
export class ScanStore {
  private readonly garments = inject(GarmentsService);

  private readonly scan = signal<GarmentScan | null>(null);

  readonly state = computed(() => this.scan()?.state ?? null);
  readonly garment = computed(() => {
    const scan = this.scan();
    return scan && scan.state !== 'invalid' ? scan.garment : null;
  });
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  async load(token: string): Promise<void> {
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.scan.set(await this.garments.scan(token));
    } catch (error) {
      this.scan.set(null);
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
```

- The store **never derives the scan state itself**. It stores what the server returned. It does not
  turn a 403 into `foreign`, it does not compare `expiresAt` to the clock to decide `expired`, and it
  does not remember a previous state for a different token.
- A failed load clears the previous scan and sets `loadError`; it does not raise a toast. The page shows
  it inline with a retry, so a failure never looks like an invalid shirt.
- Writes (claim, renew) call the service, notify through `core/feedback`, then reload the scan from the
  server rather than patching local state.
- Navigation stays in the page. No HttpClient, no Optimus UI, no Router in a store.
- One exception, and only one: `core/auth/AuthStore.logout()` injects `Router`, because it is also
  called from `session.interceptor` when a refresh fails and there is no page in that call stack to
  hand the redirect to. Any other store that wants to navigate is doing the page's job.
- Toasts go through `core/feedback/NotificationService`, never `MessageService` directly.
