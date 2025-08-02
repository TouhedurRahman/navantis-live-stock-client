import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import Swal from "sweetalert2";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useCustomer from "../../../Hooks/useCustomer";
import useUniqueProducts from "../../../Hooks/useUniqueProducts";

const AddNewDoctor = () => {
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        setValue,
        formState: { errors },
    } = useForm();

    const [uniqueProducts] = useUniqueProducts();
    const [customers] = useCustomer();

    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [upazilas, setUpazilas] = useState([]);
    const [unions, setUnions] = useState([]);

    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectValue, setSelectValue] = useState(null);

    const [selectedChemists, setSelectedChemists] = useState([]);
    const [selectKey, setSelectKey] = useState(0);

    const selectedDivisionId = watch("division");
    const selectedDistrictId = watch("district");
    const selectedUpazilaId = watch("upazila");

    useEffect(() => {
        axios.get("https://bdapi.vercel.app/api/v.1/division")
            .then(res => setDivisions(res.data.data))
            .catch(err => console.error("Error loading divisions:", err));
    }, []);

    useEffect(() => {
        if (selectedDivisionId) {
            axios.get(`https://bdapi.vercel.app/api/v.1/district/${selectedDivisionId}`)
                .then(res => setDistricts(res.data.data))
                .catch(err => console.error("Error loading districts:", err));
            setValue("district", "");
            setUpazilas([]);
            setUnions([]);
        }
    }, [selectedDivisionId]);

    useEffect(() => {
        if (selectedDistrictId) {
            axios.get(`https://bdapi.vercel.app/api/v.1/upazilla/${selectedDistrictId}`)
                .then(res => setUpazilas(res.data.data))
                .catch(err => console.error("Error loading upazilas:", err));
            setValue("upazila", "");
            setUnions([]);
        }
    }, [selectedDistrictId]);

    useEffect(() => {
        if (selectedUpazilaId) {
            axios.get(`https://bdapi.vercel.app/api/v.1/union/${selectedUpazilaId}`)
                .then(res => setUnions(res.data.data))
                .catch(err => console.error("Error loading unions:", err));
            setValue("union", "");
        }
    }, [selectedUpazilaId]);

    const handleChange = (selectedOption) => {
        if (!selectedOption) return;

        const brand = selectedOption.value;

        if (selectedBrands.includes(brand)) return;

        if (selectedBrands.length >= 4) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Selection Restricted",
                text: "You can select up to 4 brands only.",
                showConfirmButton: true
            });
        }

        const updated = [...selectedBrands, brand];
        setSelectedBrands(updated);
        setValue("brands", updated);

        setSelectValue(null);
    };

    const removeBrand = (brand) => {
        const updated = selectedBrands.filter((item) => item !== brand);
        setSelectedBrands(updated);
        setValue("brands", updated);
    };

    const brandOptions = uniqueProducts.map((product) => {
        const productName = product.productName?.trim();
        const netWeight = product.netWeight?.trim();
        const label = `${productName} - ${netWeight}`;
        return { label, value: label };
    });

    const chemistOptions = customers.map((c) => ({
        label: `${c.name} - ${c.customerId}`,
        value: { name: c.name, customerId: c.customerId, address: c.address },
    }));

    const handleChangeChemist = (selectedOptions) => {
        if (!selectedOptions) {
            setSelectedChemists([]);
            setValue("chemists", []);
            return;
        }

        const newSelection = Array.isArray(selectedOptions)
            ? selectedOptions
            : [selectedOptions];

        const merged = [...selectedChemists, ...newSelection];

        if (merged.length > 5) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Selection Restricted",
                text: "You can select up to 5 chemists only.",
                showConfirmButton: true
            });
        }

        setSelectedChemists(merged);
        setValue("chemists", merged.map((s) => s.value));

        setSelectKey((prev) => prev + 1);
    };

    const onSubmit = (data) => {
        console.log("Doctor Info Submitted:", data);
    };

    const handleNext = async () => {
        const valid = await trigger(
            step === 1
                ?
                ["name", "designation", "contact", "religion"]
                :
                step === 2
                    ?
                    ["speciality", "qualification"]
                    :
                    ["category", "practicingDay", "avgPatient"]
        );

        if (valid) {
            setCompletedSteps((prev) => [...new Set([...prev, step])]);
            setStep(step + 1);
        }
    };

    const handlePrevious = () => setStep(step - 1);

    const renderStepIndicator = (num) => (
        <div className={`flex items-center ${step >= num ? "text-blue-500 font-bold" : "text-gray-400"}`}>
            <div className={`w-6 h-6 flex items-center justify-center rounded-full border ${step >= num ? "bg-blue-500 text-white" : "bg-white border-gray-400"}`}>
                {completedSteps.includes(num) ? "✓" : num}
            </div>
            {num < 3 && <span className="w-10 h-0.5 bg-gray-300 mx-2" />}
        </div>
    );

    const showChamber = watch("hasChamber") === "yes";

    return (
        <>
            <PageTitle
                from={"Doctor"}
                to={"Add new doctor"}
            />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Add a new doctor</h1>
                <hr className='text-center border border-gray-500 mb-5' />

                <div className="flex justify-center mb-6">{[1, 2, 3].map(renderStepIndicator)}</div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-0">
                    {step === 1 && (
                        <>
                            <div className="mb-4 text-center">
                                <div className="flex justify-center mb-2">
                                    <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                        Personal Information
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Please fill in the doctor's personal details below.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Dr. Name <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("name", { required: "Required" })}
                                        placeholder="Enter doctor name"
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Designation <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("designation", { required: "Required" })}
                                        placeholder="Enter designation"
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                    {errors.designation && <p className="text-red-500 text-sm">{errors.designation.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Contact No. <span className="text-red-500">*</span></label>
                                    <input
                                        {...register("contact", { required: "Required" })}
                                        placeholder="01XXXXXXXXX"
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                    {errors.contact && <p className="text-red-500 text-sm">{errors.contact.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Email</label>
                                    <input
                                        type="email"
                                        {...register("email")}
                                        placeholder="user@email.com"
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Date of Birth</label>
                                    <input
                                        type="date"
                                        {...register("dob")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Marriage Date</label>
                                    <input
                                        type="date"
                                        {...register("marriageDate")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Religion <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("religion", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>Islam</option>
                                        <option>Hindu</option>
                                        <option>Buddhist</option>
                                        <option>Christian</option>
                                        <option>Other</option>
                                    </select>
                                    {errors.religion && <p className="text-red-500 text-sm">{errors.religion.message}</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="mb-4 text-center">
                                <div className="flex justify-center mb-2">
                                    <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                        Professional Information
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Please fill in the doctor's professional details below.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Speciality <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("speciality", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>General</option>
                                        <option>Dermatologist</option>
                                        <option>Aesthetic Dermatologist</option>
                                        <option>Gynecologist</option>
                                        <option>Pediatric</option>
                                    </select>
                                    {errors.speciality && <p className="text-red-500 text-sm">{errors.speciality.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Qualification <span className="text-red-500">*</span></label>
                                    <select
                                        {...register("qualification", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>MBBS</option>
                                        <option>FCPS</option>
                                        <option>DDV</option>
                                    </select>
                                    {errors.qualification && <p className="text-red-500 text-sm">{errors.qualification.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Passing Institute Name</label>
                                    <input
                                        {...register("institute")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                        placeholder="Enter institute name"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Passing Year</label>
                                    <input
                                        type="number"
                                        {...register("passingYear")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                        placeholder="Enter year"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div className="mb-4 text-center">
                                <div className="flex justify-center mb-2">
                                    <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                        MISC Information
                                    </h2>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Please fill in the doctor's MISC details below.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Category <span className="text-red-500">*</span></label>
                                    <select {...register("category", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Practicing Day <span className="text-red-500">*</span></label>
                                    <input {...register("practicingDay", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" onWheel={(e) => e.target.blur()} />
                                    {errors.practicingDay && <p className="text-red-500 text-sm">{errors.practicingDay.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Avg. Patient <span className="text-red-500">*</span></label>
                                    <input type="number" {...register("avgPatient", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" onWheel={(e) => e.target.blur()} />
                                    {errors.avgPatient && <p className="text-red-500 text-sm">{errors.avgPatient.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Avg. Patient/Day <span className="text-red-500">*</span></label>
                                    <input type="number" {...register("avgPatientDay", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" onWheel={(e) => e.target.blur()} />
                                    {errors.avgPatientDay && <p className="text-red-500 text-sm">{errors.avgPatientDay.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Patient Type <span className="text-red-500">*</span></label>
                                    <select {...register("patientType", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>Child</option>
                                        <option>Gyne</option>
                                    </select>
                                    {errors.patientType && <p className="text-red-500 text-sm">{errors.patientType.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Market Point <span className="text-red-500">*</span></label>
                                    <select {...register("marketPoint", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>Market Point</option>
                                    </select>
                                    {errors.marketPoint && <p className="text-red-500 text-sm">{errors.marketPoint.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Working Area <span className="text-red-500">*</span></label>
                                    <select {...register("workingArea", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>Colleague Territory</option>
                                    </select>
                                    {errors.workingArea && <p className="text-red-500 text-sm">{errors.workingArea.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Doctor Type <span className="text-red-500">*</span></label>
                                    <input {...register("doctorType", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.doctorType && <p className="text-red-500 text-sm">{errors.doctorType.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Location/Address <span className="text-red-500">*</span></label>
                                    <input {...register("locationAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.locationAddress && <p className="text-red-500 text-sm">{errors.locationAddress.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Division <span className="text-red-500">*</span></label>
                                    <select {...register("division", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">-- Select Division --</option>
                                        {divisions.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    {errors.division && <p className="text-red-500 text-sm">{errors.division.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select District <span className="text-red-500">*</span></label>
                                    <select {...register("district", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">-- Select District --</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    {errors.district && <p className="text-red-500 text-sm">{errors.district.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Upazila <span className="text-red-500">*</span></label>
                                    <select {...register("upazila", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">-- Select Upazila --</option>
                                        {upazilas.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    {errors.upazila && <p className="text-red-500 text-sm">{errors.upazila.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Union <span className="text-red-500">*</span></label>
                                    <select {...register("union", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">-- Select Union --</option>
                                        {unions.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    {errors.union && <p className="text-red-500 text-sm">{errors.union.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Territory <span className="text-red-500">*</span></label>
                                    <input {...register("territory", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.territory && <p className="text-red-500 text-sm">{errors.territory.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Job Institute Name</label>
                                    <input {...register("jobInstitute")} className="border-gray-500 bg-white border p-2 text-sm" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Visiting Address <span className="text-red-500">*</span></label>
                                    <input {...register("visitingAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.visitingAddress && <p className="text-red-500 text-sm">{errors.visitingAddress.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Location <span className="text-red-500">*</span></label>
                                    <input {...register("location", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">
                                        Brand <span className="text-red-500">*</span>
                                    </label>

                                    <Select
                                        options={brandOptions}
                                        onChange={handleChange}
                                        value={selectValue}
                                        onInputChange={() => { }}
                                        placeholder="Search or select min 1 to max 4 of brands."
                                        isSearchable
                                    // isDisabled={selectedBrands.length >= 4}
                                    />

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedBrands.map((brand, i) => (
                                            <span
                                                key={i}
                                                className="bg-white text-black text-xs px-2 py-1 border-[2px] rounded-full flex items-center gap-1"
                                            >
                                                {brand}
                                                <button
                                                    type="button"
                                                    onClick={() => removeBrand(brand)}
                                                    className="ml-1 text-red-700"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <input
                                        type="hidden"
                                        {...register("brands", {
                                            required: "At least one brand is required",
                                            validate: (value) =>
                                                value.length <= 4 || "You can select up to 4 brands",
                                        })}
                                        value={JSON.stringify(selectedBrands)}
                                    />

                                    {errors.brands && (
                                        <p className="text-red-500 text-sm mt-1">{errors.brands.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">
                                        Chemist <span className="text-red-500">*</span>
                                    </label>

                                    <Select
                                        key={selectKey}
                                        options={chemistOptions}
                                        onChange={handleChangeChemist}
                                        value={null}
                                        isSearchable
                                        isMulti={false}
                                        placeholder="Search or select min 1 to max 5 of chemists."
                                        closeMenuOnSelect={true}
                                        getOptionLabel={(e) => (
                                            <div>
                                                <div className="font-medium text-sm">{e.value.name} - {e.value.customerId}</div>
                                                <div className="text-xs text-gray-500">{e.value.address}</div>
                                            </div>
                                        )}
                                        getOptionValue={(e) => `${e.value.name}-${e.value.customerId}`}
                                        styles={{
                                            menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                        }}
                                    />

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedChemists.map((chemist, i) => (
                                            <span
                                                key={i}
                                                className="bg-white text-black text-xs px-2 py-1 border-[2px] rounded-full flex items-center gap-1"
                                            >
                                                {chemist.value.name} - {chemist.value.customerId}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = selectedChemists.filter((_, index) => index !== i);
                                                        setSelectedChemists(updated);
                                                        setValue("chemists", updated.map((s) => s.value));
                                                    }}
                                                    className="ml-1 text-red-700"
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>

                                    <input
                                        type="hidden"
                                        {...register("chemists", {
                                            required: "Please select at least 1 chemist",
                                            validate: (value) =>
                                                value.length <= 5 || "You can select up to 5 chemists only",
                                        })}
                                        value={JSON.stringify(selectedChemists.map((s) => s.value))}
                                    />

                                    {errors.chemists && (
                                        <p className="text-red-500 text-sm mt-1">{errors.chemists.message}</p>
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Has Chamber?</label>
                                    <select {...register("hasChamber")} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                {showChamber && (
                                    <>
                                        <div className="flex flex-col">
                                            <label className="text-[#6E719A] mb-1 text-sm">Chamber Name <span className="text-red-500">*</span></label>
                                            <input {...register("chamberName", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                            {errors.chamberName && <p className="text-red-500 text-sm">{errors.chamberName.message}</p>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-[#6E719A] mb-1 text-sm">Chamber Address <span className="text-red-500">*</span></label>
                                            <input {...register("chamberAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                            {errors.chamberAddress && <p className="text-red-500 text-sm">{errors.chamberAddress.message}</p>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-[#6E719A] mb-1 text-sm">Chamber Phone <span className="text-red-500">*</span></label>
                                            <input {...register("chamberPhone", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                            {errors.chamberPhone && <p className="text-red-500 text-sm">{errors.chamberPhone.message}</p>}
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={step > 1 && handlePrevious}
                            className={`px-4 py-2 rounded ${step === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"}`}
                        >
                            Previous
                        </button>
                        {
                            step < 3
                                ?
                                (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        Next
                                    </button>
                                )
                                :
                                (
                                    <button
                                        type="submit"
                                        className="bg-green-600 text-white px-4 py-2 rounded"
                                    >
                                        Submit
                                    </button>
                                )
                        }
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddNewDoctor;