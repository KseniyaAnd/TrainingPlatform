import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { UserRegistrationRequest } from '../../models/auth/user-registration.model';

@Injectable({ providedIn: 'root' })
export class UserRegistrationService {
  private readonly http = inject(HttpClient);

  register(payload: UserRegistrationRequest): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/user-registrations`, payload);
  }
}
