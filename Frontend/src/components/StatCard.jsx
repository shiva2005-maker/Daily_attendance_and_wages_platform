const StatCard = ({
    title,
    value,
    description,
    icon,
    iconBg
}) => {

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 mt-2">
                        {value}
                    </h3>

                    {description && (
                        <p className="text-xs text-slate-400 mt-2">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${iconBg}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
};

export default StatCard;