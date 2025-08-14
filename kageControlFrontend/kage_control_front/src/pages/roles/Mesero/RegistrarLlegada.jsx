import { useState, useEffect } from "react";
import axiosClient from "../../../api/axiosClient";
import butterup from "butteruptoasts";
import swal from "sweetalert";
import "../../../styles/butterup-2.0.0/butterup-2.0.0/butterup.css";
import { 
  UserPlus, Users, Phone, MapPin, Utensils, CheckCircle, AlertCircle, 
  Clock, RefreshCw, Check, X, Calendar, MessageSquare 
} from "lucide-react";

const colors = {
  primary: '#3BAEA0',
  secondary: '#E76F51', 
  accent: '#F4A261',
  dark: '#264653',
  light: '#F8FAFC',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  gray: '#6B7280'
};

// Funciones de validación mejoradas
const validateContact = (contact) => {
  if (!contact || !contact.trim()) return { isValid: true, message: "" };
  
  const value = contact.trim();
  
  // Validación de email más robusta
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  // Validación de teléfono: permite +, espacios, paréntesis, guiones
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{7,20}$/;
  
  // Limpiar teléfono para contar solo dígitos
  const cleanPhone = value.replace(/[\s\-\(\)\+]/g, '');
  
  // Verificar si es email válido
  if (emailRegex.test(value)) {
    return { isValid: true, message: "" };
  }
  
  // Verificar si es teléfono válido
  if (phoneRegex.test(value) && /^\d{7,15}$/.test(cleanPhone)) {
    return { isValid: true, message: "" };
  }
  
  // Si no es válido ninguno
  if (value.includes('@')) {
    return { isValid: false, message: "El email no tiene un formato válido" };
  } else {
    return { isValid: false, message: "El teléfono debe tener entre 7-15 dígitos" };
  }
};

export default function RegistrarLlegada() {
  const [availableTables, setAvailableTables] = useState([]);
  const [form, setForm] = useState({
    customer_name: "",
    party_size: 1,
    table_id: "",
    contact: "",
    preferences: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchAvailableTables();
  }, []);

  const fetchAvailableTables = async () => {
    try {
      const response = await axiosClient.get("/tables");
      const freeTables = response.data.filter(
        (table) => table.status === "free" || table.status === "libre"
      );
      setAvailableTables(freeTables);
    } catch (error) {
      console.error("Error al cargar mesas:", error);
      showNotification("error", "Error", "No se pudieron cargar las mesas disponibles");
    }
  };

  const showNotification = (type, title, message) => {
    butterup.toast({
      title,
      message,
      location: "top-right",
      type,
      icon: false,
      dismissable: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? parseInt(value) || 1 : value;
    
    setForm(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }

    // Validación en tiempo real para contacto
    if (name === 'contact' && value.trim()) {
      const contactValidation = validateContact(value);
      if (!contactValidation.isValid) {
        setErrors(prev => ({
          ...prev,
          contact: contactValidation.message
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          contact: ""
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Validaciones frontend antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre del cliente
    if (!form.customer_name.trim()) {
      newErrors.customer_name = "El nombre del cliente es requerido";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(form.customer_name.trim())) {
      newErrors.customer_name = "El nombre solo puede contener letras y espacios";
    } else if (form.customer_name.trim().length < 3) {
      newErrors.customer_name = "El nombre debe tener al menos 3 caracteres";
    } else if (form.customer_name.trim().length > 40) {
      newErrors.customer_name = "El nombre no puede tener más de 40 caracteres";
    }
    
    // Validar número de comensales
    if (!form.party_size || form.party_size < 1) {
      newErrors.party_size = "Debe haber al menos 1 comensal";
    } else if (form.party_size > 20) {
      newErrors.party_size = "No se pueden registrar más de 20 comensales";
    }

    // Validar contacto si se proporciona
    if (form.contact && form.contact.trim()) {
      const contactValidation = validateContact(form.contact);
      if (!contactValidation.isValid) {
        newErrors.contact = contactValidation.message;
      }
    }

    // Validar preferencias si se proporcionan
    if (form.preferences && form.preferences.trim() && form.preferences.trim().length > 100) {
      newErrors.preferences = "Las preferencias no pueden tener más de 100 caracteres";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    setTouched({
      customer_name: true,
      party_size: true,
      contact: true,
      preferences: true
    });

    // Validar formulario
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Mostrar errores con butterup
      const errorMessages = Object.values(validationErrors);
      errorMessages.forEach(error => {
        butterup.toast({
          title: "Error de validación",
          message: error,
          location: "top-right",
          type: "error",
          icon: false,
          dismissable: true
        });
      });
      
      return;
    }

    // Si pasa las validaciones, mostrar modal de confirmación con SweetAlert
    showConfirmationModal();
  };

  const showConfirmationModal = () => {
    const selectedTable = availableTables.find(t => t.id == form.table_id);
    const tableText = form.table_id 
      ? `Mesa ${selectedTable?.number || form.table_id} (Capacidad: ${selectedTable?.capacity})`
      : "Asignación automática";

    const contactText = form.contact ? `\nContacto: ${form.contact}` : "";
    const preferencesText = form.preferences ? `\nPreferencias: ${form.preferences}` : "";

    // Verificar si la mesa seleccionada es adecuada para el número de comensales
    let warningText = "";
    if (selectedTable && selectedTable.capacity < form.party_size) {
      warningText = `\n⚠️ ADVERTENCIA: La mesa seleccionada tiene capacidad para ${selectedTable.capacity} personas, pero hay ${form.party_size} comensales. ¿Desea continuar de todos modos?`;
    } else if (selectedTable && selectedTable.capacity > form.party_size + 2) {
      warningText = `\n💡 NOTA: La mesa seleccionada es bastante amplia (${selectedTable.capacity} personas) para ${form.party_size} comensales.`;
    }

    swal({
      title: "Confirmar Registro de Llegada",
      text: `Cliente: ${form.customer_name}\nComensales: ${form.party_size}\nMesa: ${tableText}${contactText}${preferencesText}${warningText}`,
      icon: selectedTable && selectedTable.capacity < form.party_size ? "warning" : "info",
      buttons: {
        cancel: {
          text: "Cancelar",
          value: false,
          visible: true,
          className: "btn-cancel",
          closeModal: true,
        },
        confirm: {
          text: selectedTable && selectedTable.capacity < form.party_size ? "Continuar de todos modos" : "Confirmar Registro",
          value: true,
          visible: true,
          className: "btn-confirm",
          closeModal: true,
        }
      },
      dangerMode: selectedTable && selectedTable.capacity < form.party_size,
    })
    .then((willConfirm) => {
      if (willConfirm) {
        confirmSubmit();
      }
    });
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        party_size: form.party_size,
        contact: form.contact.trim() || undefined,
        preferences: form.preferences.trim() || undefined,
        ...(form.table_id && { table_id: parseInt(form.table_id) }),
      };

      const response = await axiosClient.post("/arrivals", payload);
      
      const tableId = response.data.table_id;
      const assignedTime = new Date(response.data.assigned_at).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const message = `Mesa ${tableId} asignada exitosamente a ${form.party_size} comensal${form.party_size > 1 ? 'es' : ''}. Llegada registrada a las ${assignedTime}.`;
      
      setSuccessMessage(message);
      showNotification("success", "¡Registro exitoso!", message);

      // Mostrar éxito con SweetAlert también
      swal({
        title: "¡Registro exitoso!",
        text: message,
        icon: "success",
        button: "Entendido",
        timer: 4000,
      });

      // Actualizar mesas disponibles
      setAvailableTables(prev => prev.filter(table => table.id !== tableId));

      // Resetear formulario
      setForm({
        customer_name: "",
        party_size: 1,
        table_id: "",
        contact: "",
        preferences: "",
      });
      setTouched({});
      setErrors({});

    } catch (error) {
      console.error("Error al registrar llegada:", error);
      console.log("Response data:", error.response?.data);
      console.log("Response status:", error.response?.status);
      
      if (error.response?.status === 422 && error.response?.data?.detail) {
        // Errores de validación del backend
        const backendErrors = {};
        const details = error.response.data.detail;
        
        console.log("Validation details:", details);
        
        if (Array.isArray(details)) {
          details.forEach(err => {
            console.log("Processing error:", err);
            // Obtener el nombre del campo desde la estructura de Pydantic
            let fieldName = err.field || (err.loc ? err.loc[err.loc.length - 1] : 'general');
            const message = err.message || err.msg || "Campo inválido";
            
            backendErrors[fieldName] = message;
          });
        } else if (typeof details === 'object' && details.field && details.message) {
          backendErrors[details.field] = details.message;
        } else if (typeof details === 'string') {
          showNotification("error", "Error de validación", details);
          return;
        }
        
        console.log("Backend errors mapped:", backendErrors);
        setErrors(backendErrors);
        
        // Mostrar todos los errores en la notificación
        const errorCount = Object.keys(backendErrors).length;
        const firstError = Object.values(backendErrors)[0];
        const notificationMessage = errorCount === 1 
          ? firstError 
          : `Se encontraron ${errorCount} errores de validación`;
          
        showNotification("error", "Errores de validación", notificationMessage);
        
      } else if (error.response?.status === 400 && error.response?.data?.detail) {
        // Errores de negocio
        const detail = error.response.data.detail;
        if (typeof detail === 'object' && detail.field && detail.message) {
          setErrors({ [detail.field]: detail.message });
          showNotification("error", "Error", detail.message);
        } else if (typeof detail === 'string') {
          showNotification("error", "Error", detail);
        } else {
          showNotification("error", "Error", "Error en la solicitud");
        }
      } else {
        // Error genérico
        const errorMsg = error.response?.data?.detail || error.message || "Ocurrió un error inesperado al registrar la llegada";
        showNotification("error", "Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.customer_name.trim() && form.party_size >= 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <UserPlus className="w-10 h-10" style={{ color: colors.primary }} />
            Registrar Llegada
          </h1>
          <p className="text-lg text-gray-600">Registra la llegada de nuevos comensales y asigna mesa</p>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Registro exitoso</span>
            </div>
            <p className="text-green-700 mt-1">{successMessage}</p>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre del cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Nombre del cliente *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Ingrese el nombre completo"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.customer_name && touched.customer_name
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-blue-500 bg-white'
                  }`}
                  required
                />
                {errors.customer_name && touched.customer_name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.customer_name}
                  </p>
                )}
              </div>

              {/* Número de comensales */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Número de comensales *
                </label>
                <input
                  type="number"
                  name="party_size"
                  value={form.party_size}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  min="1"
                  max="20"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.party_size && touched.party_size
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-blue-500 bg-white'
                  }`}
                  required
                />
                {errors.party_size && touched.party_size && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.party_size}
                  </p>
                )}
              </div>

              {/* Mesa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Utensils className="w-4 h-4 inline mr-1" />
                  Mesa (opcional)
                </label>
                <select
                  name="table_id"
                  value={form.table_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.table_id
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-blue-500 bg-white'
                  }`}
                >
                  <option value="">Asignación automática</option>
                  {availableTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Mesa {table.number || table.id} - Capacidad: {table.capacity}
                      {table.capacity < form.party_size ? " ⚠️ Pequeña" : ""}
                      {table.capacity >= form.party_size && table.capacity <= form.party_size + 1 ? " ✓ Ideal" : ""}
                      {table.capacity > form.party_size + 2 ? " 💡 Amplia" : ""}
                    </option>
                  ))}
                </select>
                {errors.table_id && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.table_id}
                  </p>
                )}
                {form.table_id && (() => {
                  const selectedTable = availableTables.find(t => t.id == form.table_id);
                  if (selectedTable && selectedTable.capacity < form.party_size) {
                    return (
                      <p className="text-orange-600 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        ⚠️ Esta mesa es pequeña para {form.party_size} comensales (capacidad: {selectedTable.capacity})
                      </p>
                    );
                  }
                  return null;
                })()}
                <p className="text-gray-500 text-xs mt-1">
                  Si no selecciona una mesa, se asignará automáticamente la más adecuada
                </p>
              </div>

              {/* Contacto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Contacto (opcional)
                </label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Teléfono: 987654321 o Email: usuario@email.com"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.contact && touched.contact
                      ? 'border-red-300 focus:ring-red-500 bg-red-50'
                      : 'border-gray-200 focus:ring-blue-500 bg-white'
                  }`}
                />
                {errors.contact && touched.contact && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.contact}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Ejemplos válidos: 987654321, (01) 234-5678, +51 987 654 321, usuario@email.com
                </p>
              </div>
            </div>

            {/* Preferencias */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Preferencias especiales (opcional)
              </label>
              <textarea
                name="preferences"
                value={form.preferences}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Ej: Mesa cerca de la ventana, alejada del ruido, etc."
                rows="3"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                  errors.preferences && touched.preferences
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-200 focus:ring-blue-500 bg-white'
                }`}
              />
              {errors.preferences && touched.preferences && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.preferences}
                </p>
              )}
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${
                  !isFormValid || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'text-white hover:opacity-90 shadow-lg'
                }`}
                style={{ 
                  backgroundColor: !isFormValid || loading ? undefined : colors.primary 
                }}
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {loading ? 'Registrando...' : 'Registrar Llegada'}
              </button>
            </div>
          </form>
        </div>

        {/* Estilos personalizados para SweetAlert */}
        <style>{`
          .swal-modal {
            border-radius: 1rem !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          }
          .swal-title {
            color: #264653 !important;
            font-weight: 700 !important;
            font-size: 1.5rem !important;
          }
          .swal-text {
            color: #6B7280 !important;
            white-space: pre-line !important;
            line-height: 1.6 !important;
          }
          .swal-button--confirm {
            background-color: #3BAEA0 !important;
            border-radius: 0.75rem !important;
            font-weight: 600 !important;
            padding: 12px 24px !important;
            margin: 0 8px !important;
          }
          .swal-button--cancel {
            background-color: #e5e7eb !important;
            color: #6B7280 !important;
            border-radius: 0.75rem !important;
            font-weight: 600 !important;
            padding: 12px 24px !important;
            margin: 0 8px !important;
          }
          .swal-button:hover {
            opacity: 0.9 !important;
            transform: translateY(-1px) !important;
          }
          .swal-footer {
            text-align: center !important;
            padding-top: 20px !important;
          }
        `}</style>
      </div>
    </div>
  );
}
