function SettingsPage() {
    return ( 
        <main>
            Pagina de configuraciones

            <a href="/dashboard/settings/privileges">
                <button>Ver privilegios</button>
            </a>

            <a href="/dashboard/settings/users">
                <button>Ver usuarios</button>
            </a>

            <a href="/dashboard/settings/roles">
                <button>Ver roles</button>
            </a>

        </main>
     );
}

export default SettingsPage;