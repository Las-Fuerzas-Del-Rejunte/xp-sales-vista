import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { supabase } from '../../integrations/supabase/client';
import Window from '../Layout/Window';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { profile, setCurrentView } = useAuth() as any;
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'empleado' ? 'inactivo' : 'empleado';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', userId);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Window id="users-denied" icon="🚫" title="Acceso Denegado" width="100%">
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
            <h3>Acceso Restringido</h3>
            <p>Solo los administradores pueden acceder a la gestión de usuarios.</p>
            <button onClick={() => setCurrentView('dashboard')} style={{ marginTop: '16px' }}>
              Volver al Dashboard
            </button>
          </div>
        </Window>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Window id="users" icon="👥" title="Gestión de Usuarios - Panel de Administración" width="100%">
        <div>
          {/* Toolbar */}
          <fieldset style={{ border: '1px groove #c0c0c0', padding: '8px', marginBottom: '16px' }}>
            <legend style={{ fontSize: '10px', color: '#666' }}>Herramientas</legend>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentView('dashboard')}
                style={{ fontSize: '11px', padding: '4px 8px' }}
              >
                🏠 Dashboard
              </button>
              <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#666' }}>
                Total usuarios: {users.length}
              </div>
            </div>
          </fieldset>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div>Cargando usuarios...</div>
            </div>
          ) : (
            <fieldset style={{ border: '2px groove #c0c0c0', padding: '16px' }}>
              <legend style={{ fontWeight: 'bold' }}>Lista de Usuarios</legend>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ background: '#e0e0e0' }}>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'left' }}>Nombre</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'left' }}>Email</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>Rol</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>Estado</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>Registrado</th>
                      <th style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #c0c0c0' }}>
                        <td style={{ border: '1px solid #c0c0c0', padding: '8px' }}>
                          {user.name}
                        </td>
                        <td style={{ border: '1px solid #c0c0c0', padding: '8px' }}>
                          {user.email}
                        </td>
                        <td style={{ 
                          border: '1px solid #c0c0c0', 
                          padding: '8px', 
                          textAlign: 'center',
                          fontWeight: 'bold',
                          color: user.role === 'admin' ? '#ff0000' : user.role === 'empleado' ? '#008000' : '#666'
                        }}>
                          {user.role === 'admin' ? '👑 Admin' : 
                           user.role === 'empleado' ? '👤 Empleado' : 
                           '❌ Inactivo'}
                        </td>
                        <td style={{ 
                          border: '1px solid #c0c0c0', 
                          padding: '8px', 
                          textAlign: 'center'
                        }}>
                          <span style={{
                            padding: '2px 6px',
                            border: '1px solid',
                            borderRadius: '2px',
                            fontSize: '10px',
                            backgroundColor: user.role === 'inactivo' ? '#ffcccc' : '#ccffcc',
                            borderColor: user.role === 'inactivo' ? '#ff0000' : '#008000'
                          }}>
                            {user.role === 'inactivo' ? 'INACTIVO' : 'ACTIVO'}
                          </span>
                        </td>
                        <td style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ border: '1px solid #c0c0c0', padding: '8px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {user.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => toggleUserStatus(user.user_id, user.role)}
                                  style={{
                                    fontSize: '10px',
                                    padding: '2px 6px',
                                    backgroundColor: user.role === 'empleado' ? '#ffcccc' : '#ccffcc',
                                    border: '1px solid',
                                    borderColor: user.role === 'empleado' ? '#ff0000' : '#008000'
                                  }}
                                >
                                  {user.role === 'empleado' ? '🚫 Desactivar' : '✅ Activar'}
                                </button>
                                {user.role === 'empleado' && (
                                  <button
                                    onClick={() => promoteToAdmin(user.user_id)}
                                    style={{
                                      fontSize: '10px',
                                      padding: '2px 6px',
                                      backgroundColor: '#ffffcc',
                                      border: '1px solid #ffaa00'
                                    }}
                                  >
                                    👑 Hacer Admin
                                  </button>
                                )}
                              </>
                            )}
                            {user.role === 'admin' && (
                              <span style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                                Administrador
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </fieldset>
          )}

          {/* Status Bar */}
          <div style={{ 
            background: '#e0e0e0', 
            border: '1px inset #c0c0c0', 
            padding: '4px 8px', 
            fontSize: '10px', 
            color: '#666',
            marginTop: '16px'
          }}>
            Estado: Sistema operativo | Usuarios registrados: {users.length} | Última actualización: {new Date().toLocaleString()}
          </div>
        </div>
      </Window>
    </div>
  );
};

export default UserManagement;