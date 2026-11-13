<nav class="mobile-nav rich-nav">
    <div class="sidebar-brand-header">
        <span class="sidebar-brand-mark">D</span>
        <div class="sidebar-brand-info">
            <strong class="sidebar-brand-name">Docan</strong>
            <small class="sidebar-brand-outlet">{{ auth()->user()?->outlet?->name ?? 'Outlet Kasir' }}</small>
        </div>
    </div>
    <a @class(['active'=>request()->routeIs('pos')]) href="{{ route('pos') }}"><b><svg viewBox="0 0 24 24"><path d="M3 5h2l2 10h10l2-7H6M9 20h.01M17 20h.01"/></svg></b><span>Kasir</span></a>
    @if(auth()->user()?->isOwner())<a @class(['active'=>request()->routeIs('products.index')&&!request('stock')]) href="{{ route('products.index') }}"><b><svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/></svg></b><span>Stok Produk</span></a>@endif
    @if(auth()->user()?->isFrontliner())<a @class(['active'=>request()->routeIs('products.index')]) href="{{ route('products.index',['stock'=>1]) }}"><b><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM8 7V4h8v3M8 12h8M12 9v6"/></svg></b><span>Stok</span></a>@endif
    @if(auth()->user()?->isOwner())<a @class(['active'=>request()->routeIs('reports.*')]) href="{{ route('reports.index') }}"><b><svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg></b><span>Laporan</span></a>@endif
    @if(auth()->user()?->isOwner())<a @class(['active'=>request()->routeIs('operational-expenses.*')]) href="{{ route('operational-expenses.index') }}"><b><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM7 4h10v3M8 11h8M8 15h5"/></svg></b><span>Biaya Operasional</span></a>@endif
    <a @class(['active'=>request()->routeIs('settings.*')]) href="{{ route('settings.index') }}"><b><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg></b><span>Pengaturan</span></a>
    @if(auth()->check())
    <div class="sidebar-user-footer">
        <span class="sidebar-user-avatar">{{ strtoupper(substr(auth()->user()->name ?? 'U', 0, 1)) }}</span>
        <div class="sidebar-user-meta">
            <strong class="sidebar-user-name">{{ auth()->user()->name }}</strong>
            <small class="sidebar-user-role">{{ auth()->user()->isOwner() ? 'Owner Outlet' : 'Kasir Outlet' }}</small>
        </div>
    </div>
    @endif
</nav>
