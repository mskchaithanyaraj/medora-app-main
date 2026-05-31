import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../../components/login/login.component';
import { RegisterComponent } from '../../components/register/register.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  protected readonly showLoginModal = signal(false);
  protected readonly showRegisterModal = signal(false);
  protected readonly isDarkMode = signal(false);
  
  protected readonly features = [
    {
      icon: 'hospital',
      title: 'Find Hospitals',
      description: 'Search and connect with verified hospitals across the country with real-time availability.'
    },
    {
      icon: 'stethoscope',
      title: 'Expert Doctors',
      description: 'Access qualified and experienced doctors from various specializations at your convenience.'
    },
    {
      icon: 'calendar',
      title: 'Easy Appointments',
      description: 'Book, manage, and track your medical appointments seamlessly with instant confirmations.'
    },
    {
      icon: 'pill',
      title: 'Digital Prescriptions',
      description: 'Receive and manage your prescriptions digitally, accessible anytime, anywhere.'
    },
    {
      icon: 'star',
      title: 'Reviews & Ratings',
      description: 'Make informed decisions based on genuine patient reviews and ratings.'
    },
    {
      icon: 'shield-check',
      title: 'Secure & Private',
      description: 'Your medical data is encrypted and protected with industry-standard security.'
    }
  ];

  protected readonly testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      avatar: 'user',
      rating: 5,
      comment: 'Medora made it so easy to find a specialist and book an appointment. The entire process was seamless!'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      avatar: 'user-round',
      rating: 5,
      comment: 'As a doctor, Medora helps me manage my appointments efficiently. The prescription system is fantastic.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Patient',
      avatar: 'user',
      rating: 5,
      comment: 'I love how I can access all my prescriptions in one place. Very convenient and user-friendly!'
    }
  ];

  protected readonly stats = [
    { value: '50+', label: 'Hospitals' },
    { value: '300+', label: 'Doctors' },
    { value: '1000+', label: 'Patients' },
    { value: '5000+', label: 'Appointments' }
  ];

  openLoginModal(): void {
    this.showLoginModal.set(true);
    this.showRegisterModal.set(false);
  }

  openRegisterModal(): void {
    this.showRegisterModal.set(true);
    this.showLoginModal.set(false);
  }

  closeModals(): void {
    this.showLoginModal.set(false);
    this.showRegisterModal.set(false);
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    if (this.isDarkMode()) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
