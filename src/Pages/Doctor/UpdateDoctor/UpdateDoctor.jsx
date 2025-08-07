import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useApiConfig from "../../../Hooks/useApiConfig";
import useCustomer from "../../../Hooks/useCustomer";
import useDoctors from "../../../Hooks/useDoctors";
import useDrDesignations from "../../../Hooks/useDrDesignations";
import useDrQualifications from "../../../Hooks/useDrQualifications";
import useDrSpecialities from "../../../Hooks/useDrSpecialities";
import useSingleUser from "../../../Hooks/useSingleUser";
import useUniqueProducts from "../../../Hooks/useUniqueProducts";

const UpdateDoctor = () => {
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        setValue,
        reset,
        formState: { errors },
    } = useForm();

    const [uniqueProducts] = useUniqueProducts();
    const [singleUser] = useSingleUser();
    const [customers] = useCustomer();
    const [doctors, loading, refetch] = useDoctors();
    const baseUrl = useApiConfig();

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

    const [designations] = useDrDesignations();
    const [specialties] = useDrSpecialities();
    const [qualifications] = useDrQualifications();

    const { id } = useParams();
    const doctor = doctors.find(doctor => doctor._id == id);

    const navigate = useNavigate();

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

        const selected = selectedOption.value;

        const exists = selectedBrands.some(
            (b) => b.name === selected.name && b.netWeight === selected.netWeight
        );
        if (exists) return;

        if (selectedBrands.length >= 4) {
            return Swal.fire({
                position: "center",
                icon: "error",
                title: "Selection Restricted",
                text: "You can select up to 4 brands only.",
                showConfirmButton: true,
            });
        }

        const updated = [...selectedBrands, selected];
        setSelectedBrands(updated);
        setValue("brands", updated);

        setSelectValue(null);
    };

    const removeBrand = (brand) => {
        const updated = selectedBrands.filter(
            (item) => item.name !== brand.name || item.netWeight !== brand.netWeight
        );
        setSelectedBrands(updated);
        setValue("brands", updated);
    };

    const brandOptions = uniqueProducts.map((product) => {
        const name = product.productName?.trim();
        const netWeight = product.netWeight?.trim();
        return {
            label: `${name} - ${netWeight}`,
            value: { name, netWeight },
        };
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

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const statusType =
        singleUser?.parentId !== null && singleUser?.parentId !== "Vacant"
            ? "pending"
            : singleUser?.grandParentId !== null && singleUser?.grandParentId !== "Vacant"
                ? "initialized"
                : "requested";

    const updateDoctorMutation = useMutation({
        mutationFn: async (data) => {
            const selectedDivision = divisions.find(d => d.id === data.division);
            const selectedDistrict = districts.find(d => d.id === data.district);
            const selectedUpazila = upazilas.find(u => u.id === data.upazila);
            const selectedUnion = unions.find(u => u.id === data.union);

            const updatedDoctor = {
                ...data,
                division: selectedDivision?.name || "",
                district: selectedDistrict?.name || "",
                upazila: selectedUpazila?.name || "",
                union: selectedUnion?.name || "",

                parentTerritory: singleUser?.parentTerritory,
                parentId: singleUser?.parentId || null,
                grandParentId: singleUser?.grandParentId || null,

                addedBy: singleUser?.name,
                addedEmail: singleUser?.email,

                status: statusType,
                date: getTodayDate()
            };

            const response = await axios.patch(`${baseUrl}/doctor/${id}`, updatedDoctor);
            return response.data;
        },
        onError: (error) => {
            console.error("Error updating doctor", error);
        },
    });

    const onSubmit = async (data) => {
        try {
            await Promise.all([
                updateDoctorMutation.mutateAsync(data),
            ]);

            reset();
            refetch();
            navigate('/doctor-list');
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Doctor successfully updated.",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Faild to update doctor",
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    return (
        <>
            <PageTitle
                from={"Doctor"}
                to={"Update doctor"}
            />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Update doctor</h1>
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
                                        defaultValue={doctor?.name}
                                        {...register("name", { required: "Required" })}
                                        placeholder="Enter doctor name"
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Designation <span className="text-red-500">*</span></label>
                                    <select
                                        defaultValue={doctor?.designation}
                                        {...register("designation", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm cursor-pointer"
                                    >
                                        <option value="" disabled>Select Dr. Designation</option>
                                        {designations.map((designation, index) => (
                                            <option key={index} value={designation}>
                                                {designation}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.designation && <p className="text-red-500 text-sm">{errors.designation.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Contact No. <span className="text-red-500">*</span></label>
                                    <input
                                        defaultValue={doctor?.contact}
                                        {...register("contact", { required: "Required" })}
                                        placeholder="01XXXXXXXXX"
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                    {errors.contact && <p className="text-red-500 text-sm">{errors.contact.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Email</label>
                                    <input
                                        defaultValue={doctor?.email}
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
                                        defaultValue={doctor?.dob}
                                        type="date"
                                        {...register("dob")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Marriage Date</label>
                                    <input
                                        defaultValue={doctor?.marriageDate}
                                        type="date"
                                        {...register("marriageDate")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Religion <span className="text-red-500">*</span></label>
                                    <select
                                        defaultValue={doctor?.religion}
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
                                        defaultValue={doctor?.speciality}
                                        {...register("speciality", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm cursor-pointer"
                                    >
                                        <option value="" disabled>Select Dr. Speciality</option>
                                        {specialties.map((speciality, index) => (
                                            <option key={index} value={speciality}>
                                                {speciality}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.speciality && <p className="text-red-500 text-sm">{errors.speciality.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Qualification <span className="text-red-500">*</span></label>
                                    <select
                                        defaultValue={doctor?.qualification}
                                        {...register("qualification", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm cursor pointer"
                                    >
                                        <option value="" disabled>Select Dr. Qualification</option>
                                        {qualifications.map((qualification, index) => (
                                            <option key={index} value={qualification}>
                                                {qualification}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.qualification && <p className="text-red-500 text-sm">{errors.qualification.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Passing Institute Name</label>
                                    <input
                                        defaultValue={doctor?.intitute}
                                        {...register("institute")}
                                        className="border-gray-500 bg-white border p-2 text-sm"
                                        placeholder="Enter institute name"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Passing Year</label>
                                    <input
                                        type="number"
                                        defaultValue={doctor?.passingYear}
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
                                    <select defaultValue={doctor?.category} {...register("category", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Practicing Day <span className="text-red-500">*</span></label>
                                    <input defaultValue={doctor?.practicingDay} {...register("practicingDay", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" onWheel={(e) => e.target.blur()} />
                                    {errors.practicingDay && <p className="text-red-500 text-sm">{errors.practicingDay.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Avg. Patient <span className="text-red-500">*</span></label>
                                    <input type="number" defaultValue={doctor?.avgPatient} {...register("avgPatient", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" onWheel={(e) => e.target.blur()} />
                                    {errors.avgPatient && <p className="text-red-500 text-sm">{errors.avgPatient.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Avg. Patient/Day <span className="text-red-500">*</span></label>
                                    <input type="number" defaultValue={doctor?.avgPatientDay} {...register("avgPatientDay", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" onWheel={(e) => e.target.blur()} />
                                    {errors.avgPatientDay && <p className="text-red-500 text-sm">{errors.avgPatientDay.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Practicing Type <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.practicingType} {...register("practicingType", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select a Practicing Type</option>
                                        <option>Regular</option>
                                        <option>Guest</option>
                                        <option>Year</option>
                                        <option>CNH</option>
                                        <option>KOL</option>
                                    </select>
                                    {errors.practicingType && <p className="text-red-500 text-sm">{errors.practicingType.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Market Point <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.marketPoint} {...register("marketPoint", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>Market Point</option>
                                    </select>
                                    {errors.marketPoint && <p className="text-red-500 text-sm">{errors.marketPoint.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Working Area <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.workingArea} {...register("workingArea", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm cursor-pointer">
                                        <option value="">Select</option>
                                        <option>HQ</option>
                                        <option>Ex. HQ</option>
                                        <option>Outstation</option>
                                    </select>
                                    {errors.workingArea && <p className="text-red-500 text-sm">{errors.workingArea.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Doctor Type <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.doctorType} {...register("doctorType", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm cursor-pointer">
                                        <option value="">Select</option>
                                        <option>Qualified</option>
                                        <option>Non Qualified</option>
                                    </select>
                                    {errors.doctorType && <p className="text-red-500 text-sm">{errors.doctorType.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Location/Address <span className="text-red-500">*</span></label>
                                    <input defaultValue={doctor?.locationAddress} {...register("locationAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.locationAddress && <p className="text-red-500 text-sm">{errors.locationAddress.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Division <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.division} {...register("division", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select Division</option>
                                        {divisions.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    {errors.division && <p className="text-red-500 text-sm">{errors.division.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select District <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.district} {...register("district", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select District</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                    {errors.district && <p className="text-red-500 text-sm">{errors.district.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Upazila <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.upazila} {...register("upazila", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select Upazila</option>
                                        {upazilas.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    {errors.upazila && <p className="text-red-500 text-sm">{errors.upazila.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Union <span className="text-red-500">*</span></label>
                                    <select defaultValue={doctor?.union} {...register("union", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select Union</option>
                                        {unions.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    {errors.union && <p className="text-red-500 text-sm">{errors.union.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Territory <span className="text-red-500">*</span></label>
                                    <input
                                        defaultValue={singleUser?.territory}
                                        {...register("territory", { required: "Required" })}
                                        className="border-gray-500 bg-white border p-2 text-sm cursor-not-allowed"
                                        readOnly
                                    />
                                    {errors.territory && <p className="text-red-500 text-sm">{errors.territory.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Job Institute Name</label>
                                    <input defaultValue={doctor?.jobInstitute} {...register("jobInstitute")} className="border-gray-500 bg-white border p-2 text-sm" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Visiting Address <span className="text-red-500">*</span></label>
                                    <input defaultValue={doctor?.visitingAddress} {...register("visitingAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.visitingAddress && <p className="text-red-500 text-sm">{errors.visitingAddress.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Location <span className="text-red-500">*</span></label>
                                    <input defaultValue={doctor?.location} {...register("location", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
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
                                        placeholder="Search or select min 1 to max 4 of brands."
                                        isSearchable
                                    />

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedBrands.map((brand, i) => (
                                            <span
                                                key={i}
                                                className="bg-white text-black text-xs px-2 py-1 border-[2px] rounded-full flex items-center gap-1"
                                            >
                                                {brand.name} - {brand.netWeight}
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
                                    <select {...register("hasChamber", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                {showChamber && (
                                    <>
                                        <div className="flex flex-col">
                                            <label className="text-[#6E719A] mb-1 text-sm">Chamber Name <span className="text-red-500">*</span></label>
                                            <input defaultValue={doctor?.chamberName} {...register("chamberName", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                            {errors.chamberName && <p className="text-red-500 text-sm">{errors.chamberName.message}</p>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-[#6E719A] mb-1 text-sm">Chamber Address <span className="text-red-500">*</span></label>
                                            <input defaultValue={doctor?.chamberAddress} {...register("chamberAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                            {errors.chamberAddress && <p className="text-red-500 text-sm">{errors.chamberAddress.message}</p>}
                                        </div>

                                        <div className="flex flex-col">
                                            <label className="text-[#6E719A] mb-1 text-sm">Chamber Phone <span className="text-red-500">*</span></label>
                                            <input defaultValue={doctor?.chamberPhone} {...register("chamberPhone", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
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

export default UpdateDoctor;