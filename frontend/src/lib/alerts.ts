import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

export const AppSwal = withReactContent(Swal);

const alertTheme = {
  background: '#1a1a1a',
  color: '#fff',
  confirmButtonColor: '#dc2626',
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return fallback;
};

export const showErrorAlert = (error: unknown, fallback: string) =>
  AppSwal.fire({
    title: 'Erro',
    text: extractErrorMessage(error, fallback),
    icon: 'error',
    ...alertTheme,
  });

export const showSuccessAlert = (title: string, text: string) =>
  AppSwal.fire({
    title,
    text,
    icon: 'success',
    ...alertTheme,
  });
