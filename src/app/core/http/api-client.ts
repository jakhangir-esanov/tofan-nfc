import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import { Query } from './api.dto';
import { toDomainError } from './api-error.mapper';
import { unwrapResult } from './result-envelope';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly anonymousHttp = new HttpClient(inject(HttpBackend));
  private readonly baseUrl = inject(API_BASE_URL);

  url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  get<TResponse>(path: string, query: Query = {}): Promise<TResponse> {
    return this.send(this.http.get<unknown>(this.url(path), { params: toHttpParams(query) }));
  }

  post<TResponse>(path: string, body: unknown = null): Promise<TResponse> {
    return this.send(this.http.post<unknown>(this.url(path), body));
  }

  getAnonymously<TResponse>(path: string, query: Query = {}): Promise<TResponse> {
    return this.send(
      this.anonymousHttp.get<unknown>(this.url(path), { params: toHttpParams(query) }),
    );
  }

  postAnonymously<TResponse>(path: string, body: unknown): Promise<TResponse> {
    return this.send(this.anonymousHttp.post<unknown>(this.url(path), body));
  }

  private async send<TResponse>(request: Observable<unknown>): Promise<TResponse> {
    try {
      return unwrapResult(await firstValueFrom(request)) as TResponse;
    } catch (error) {
      throw toDomainError(error);
    }
  }
}

function toHttpParams(query: Query): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      params = params.set(key, value);
    }
  }
  return params;
}
