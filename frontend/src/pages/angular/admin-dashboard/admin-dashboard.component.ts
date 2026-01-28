import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';

interface Product {
    id: number;
    name: string;
    farmer_name: string;
    base_price: number;
    final_price: number;
    image?: string;
}

interface Stats {
    total_savings: number;
    total_farmers: number;
    total_buyers: number;
    total_revenue: number;
    recent_activity: { detail: string; date: string }[];
}

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
            ]),
        ]),
    ],
})
export class AdminDashboardComponent implements OnInit {
    pendingProducts: Product[] = [];
    stats: Stats | null = null;
    activeTab: 'moderation' | 'activity' = 'moderation';
    loading = false;
    token = localStorage.getItem('token');

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData(): void {
        if (!this.token) {
            console.error('No token found');
            return;
        }

        const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

        // Using forkJoin would be better in a real app, but keep it simple for now
        this.http.get<Product[]>('http://localhost:5000/api/admin/pending-products', { headers })
            .subscribe({
                next: (data) => this.pendingProducts = data,
                error: () => console.error('Failed to fetch pending products')
            });

        this.http.get<Stats>('http://localhost:5000/api/admin/stats', { headers })
            .subscribe({
                next: (data) => this.stats = data,
                error: () => console.error('Failed to fetch stats')
            });
    }

    handleAction(productId: number, action: string): void {
        const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
        this.http.post('http://localhost:5000/api/admin/product-action',
            { product_id: productId, action },
            { headers }
        ).subscribe({
            next: () => this.fetchData(),
            error: () => alert('Action failed')
        });
    }

    setActiveTab(tab: 'moderation' | 'activity'): void {
        this.activeTab = tab;
    }
}
