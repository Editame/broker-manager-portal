'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Plus, Settings, Trash2, Play, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';
import { BrokerConnection, CreateConnectionRequest, TestConnectionResponse } from '@/types/connection';
import { 
  getAllConnections, 
  createConnection, 
  updateConnection,
  deleteConnection, 
  testConnection,
  activateConnection 
} from '@/lib/api/connections';
import { useConnections } from '@/hooks/useConnections';

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange?: () => void;
  canClose?: boolean;
}

export function ConnectionModal({ isOpen, onClose, onConnectionChange, canClose = true }: ConnectionModalProps) {
  const { connectToConnection } = useConnections();
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<BrokerConnection | null>(null);
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState<CreateConnectionRequest>({
    name: '',
    host: '',
    port: 1099,
    username: '',
    password: '',
    environment: 'development',
    description: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null);
  const [testingForm, setTestingForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('ConnectionModal: Cargando conexiones...');
      loadConnections();
    }
  }, [isOpen]);

  const loadConnections = async () => {
    try {
      console.log('loadConnections: Iniciando carga de conexiones...');
      setLoading(true);
      const data = await getAllConnections();
      console.log('loadConnections: Conexiones cargadas', data);
      setConnections(data);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateConnectionRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear test result when form changes
    setTestResult(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.host.trim()) errors.host = 'El host es obligatorio';
    if (formData.port < 1 || formData.port > 65535) errors.port = 'Puerto debe estar entre 1 y 65535';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleTestConnection = async () => {
    if (!validateForm()) return;
    
    try {
      setTestingForm(true);
      
      // Si estamos editando una conexión existente, usar su ID
      if (editingConnection?.id) {
        const result = await testConnection(editingConnection.id);
        setTestResult(result);
      } else {
        // Para nuevas conexiones, necesitaríamos una función diferente
        // Por ahora, mostrar mensaje de que debe guardarse primero
        setTestResult({
          status: 'ERROR',
          success: false,
          message: 'Debe guardar la conexión antes de probarla',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      setTestResult({
        status: 'ERROR',
        success: false,
        message: 'Error al probar la conexión',
        timestamp: new Date().toISOString()
      });
    } finally {
      setTestingForm(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editingConnection) {
        // Actualizar conexión existente
        const updateData = {
          ...formData,
          active: editingConnection.active // Mantener el estado activo actual
        };
        await updateConnection(editingConnection.id, updateData);
      } else {
        // Crear nueva conexión
        await createConnection(formData);
      }
      
      await loadConnections();
      setShowForm(false);
      resetForm();
      onConnectionChange?.();
    } catch (error) {
      console.error(`Error ${editingConnection ? 'updating' : 'creating'} connection:`, error);
      setFormErrors({ general: `Error al ${editingConnection ? 'actualizar' : 'crear'} la conexión` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conexión?')) return;
    
    try {
      setLoading(true);
      await deleteConnection(id);
      await loadConnections();
      onConnectionChange?.();
    } catch (error) {
      console.error('Error deleting connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestExistingConnection = async (id: string) => {
    try {
      setTestingConnections(prev => new Set(prev).add(id));
      await testConnection(id);
      await loadConnections();
    } catch (error) {
      console.error('Error testing connection:', error);
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleConnectToConnection = async (id: string) => {
    try {
      setLoading(true);
      await connectToConnection(id);
      await loadConnections();
      onConnectionChange?.();
      
      // Cerrar modal después de conectar exitosamente
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error connecting to broker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateConnection = async (id: string) => {
    try {
      setLoading(true);
      await activateConnection(id);
      await loadConnections();
      onConnectionChange?.();
    } catch (error) {
      console.error('Error activating connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      port: 1099,
      username: '',
      password: '',
      environment: 'development',
      description: ''
    });
    setFormErrors({});
    setTestResult(null);
    setEditingConnection(null);
  };

  const handleEditConnection = (connection: BrokerConnection) => {
    setEditingConnection(connection);
    setFormData({
      name: connection.name,
      host: connection.host,
      port: connection.port,
      username: connection.username || '',
      password: '', // No mostrar la contraseña por seguridad
      environment: connection.environment,
      description: connection.description || ''
    });
    setFormErrors({});
    setTestResult(null);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingConnection(null);
    setShowForm(false);
    resetForm();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'TESTING':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Gestión de Conexiones</h2>
          </div>
          {canClose && (
            <Button variant="ghost" onClick={onClose} size="sm">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!showForm ? (
            <>
              {/* Add Connection Button */}
              <div className="mb-6">
                <Button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Nueva Conexión
                </Button>
              </div>

              {/* Connections List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando conexiones...</p>
                  </div>
                ) : connections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay conexiones configuradas</p>
                  </div>
                ) : (
                  connections.map((connection) => (
                    <div 
                      key={connection.id} 
                      className={`border rounded-lg p-4 ${connection.active ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                            {connection.active && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Activa
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              {getStatusIcon(connection.lastTestStatus)}
                              <span className="text-sm text-gray-600">
                                {connection.lastTestStatus === 'CONNECTED' ? 'Conectado' :
                                 connection.lastTestStatus === 'ERROR' ? 'Error' :
                                 connection.lastTestStatus === 'TESTING' ? 'Probando...' : 'Desconocido'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Host:</strong> {connection.host}:{connection.port}</p>
                            <p><strong>Entorno:</strong> {connection.environment}</p>
                            {connection.requiresAuth && (
                              <p><strong>Usuario:</strong> {connection.username}</p>
                            )}
                            {connection.description && (
                              <p><strong>Descripción:</strong> {connection.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {/* Botón Conectar - Principal */}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleConnectToConnection(connection.id)}
                            disabled={loading}
                            title="Conectar a este broker"
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            🔌 Conectar
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTestExistingConnection(connection.id)}
                            disabled={testingConnections.has(connection.id)}
                            title="Probar conexión"
                          >
                            <Play className={`h-4 w-4 ${testingConnections.has(connection.id) ? 'animate-spin' : ''}`} />
                          </Button>
                          
                          {!connection.active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateConnection(connection.id)}
                              disabled={loading}
                              title="Activar conexión"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditConnection(connection)}
                            disabled={loading}
                            title="Editar conexión"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteConnection(connection.id)}
                            disabled={connection.active || loading}
                            title="Eliminar conexión"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Add Connection Form */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingConnection ? 'Editar Conexión' : 'Nueva Conexión'}
                </h3>
                <Button variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Producción, Desarrollo, etc."
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entorno
                  </label>
                  <select
                    value={formData.environment}
                    onChange={(e) => handleInputChange('environment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="development">Desarrollo</option>
                    <option value="staging">Staging</option>
                    <option value="production">Producción</option>
                    <option value="local">Local</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host *
                  </label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => handleInputChange('host', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.host ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="localhost, 192.168.1.100, broker.example.com"
                  />
                  {formErrors.host && <p className="text-red-500 text-sm mt-1">{formErrors.host}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto JMX *
                  </label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 1099)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.port ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="1"
                    max="65535"
                  />
                  {formErrors.port && <p className="text-red-500 text-sm mt-1">{formErrors.port}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin, user, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña (opcional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  {editingConnection && (
                    <p className="text-xs text-gray-500 mt-1">
                      Deja vacío para mantener la contraseña actual
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de la conexión..."
                />
              </div>

              {/* Test Result */}
              {testResult && (
                <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.message}
                    </span>
                  </div>
                </div>
              )}

              {editingConnection?.active && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Esta conexión está actualmente activa. Los cambios se aplicarán inmediatamente.
                    </span>
                  </div>
                </div>
              )}

              {formErrors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{formErrors.general}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleTestConnection}
                  disabled={testingForm}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Play className={`h-4 w-4 ${testingForm ? 'animate-spin' : ''}`} />
                  {testingForm ? 'Probando...' : 'Probar Conexión'}
                </Button>
                
                <Button
                  onClick={handleSaveConnection}
                  disabled={loading || testingForm}
                  className="flex items-center gap-2"
                >
                  {editingConnection ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {loading 
                    ? (editingConnection ? 'Actualizando...' : 'Creando...') 
                    : (editingConnection ? 'Actualizar Conexión' : 'Crear Conexión')
                  }
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={loading || testingForm}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
