import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { portalAuthGuard } from './portal-auth.guard';
import { PortalAuthService } from '../services/portal-auth.service';

describe('portalAuthGuard', () => {
  let authServiceSpy: jasmine.SpyObj<PortalAuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('PortalAuthService', ['isLoggedIn']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PortalAuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/portal/dashboard' } as RouterStateSnapshot;
  });

  it('should return true when user is logged in', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(true);

    // Act
    const result = TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(result).toBeTrue();
  });

  it('should return UrlTree to /portal/login when user is not logged in', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(false);
    const mockUrlTree = new UrlTree();
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    // Act
    const result = TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(result).toBe(mockUrlTree);
  });

  it('should create UrlTree with returnUrl query param', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue(new UrlTree());

    // Act
    TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/portal/login'],
      { queryParams: { returnUrl: '/portal/dashboard' } }
    );
  });

  it('should pass the correct returnUrl from state.url', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue(new UrlTree());
    mockState = { url: '/portal/appointments' } as RouterStateSnapshot;

    // Act
    TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/portal/login'],
      { queryParams: { returnUrl: '/portal/appointments' } }
    );
  });

  it('should not create UrlTree when user is logged in', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(true);

    // Act
    TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
  });

  it('should call isLoggedIn on the auth service', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(true);

    // Act
    TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(authServiceSpy.isLoggedIn).toHaveBeenCalledTimes(1);
  });

  it('should handle deeply nested portal URLs', () => {
    // Arrange
    authServiceSpy.isLoggedIn.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue(new UrlTree());
    mockState = { url: '/portal/invoices/123/details' } as RouterStateSnapshot;

    // Act
    TestBed.runInInjectionContext(() => portalAuthGuard(mockRoute, mockState));

    // Assert
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(
      ['/portal/login'],
      { queryParams: { returnUrl: '/portal/invoices/123/details' } }
    );
  });
});
