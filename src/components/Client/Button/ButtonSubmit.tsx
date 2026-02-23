import React from 'react';

interface ButtonSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: string;
    loading?: boolean;
}

const ButtonSubmit: React.FC<ButtonSubmitProps> = ({
    label,
    icon = "",
    loading = false,
    className = "",
    ...props
}) => {
    return (
        <button
            {...props}
            disabled={loading || props.disabled}
            className={`w-full bg-primary text-white font-bold py-2 md:py-3 rounded-xl shadow-xl shadow-primary/20 
                hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 
                disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? (
                // Hiệu ứng Loading xoay tròn nếu cần
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                    <span>{label}</span>
                    {icon && <span className="material-symbols-outlined text-xl">{icon}</span>}
                </>
            )}
        </button>
    );
};

export default ButtonSubmit;