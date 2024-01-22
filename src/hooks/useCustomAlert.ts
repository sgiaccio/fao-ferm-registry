import { inject } from 'vue';

// Define the type of the showAlert function
export type ShowAlertFunction = (title: string, message: string, type: string, options?: any) => void;

export function useCustomAlert(): ShowAlertFunction {
    const showAlert = inject<ShowAlertFunction>('customAlert');
    return (title: string, message: string, type: string, options) => {
        if (showAlert) {
            showAlert(title, message, type, options);
        }
    }
}
