import { useState } from "react";
import { useForm } from "react-hook-form";
import PageTitle from "../../../Components/PageTitle/PageTitle";

const AddNewDoctor = () => {
    const [step, setStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
    } = useForm();

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
                                    <input {...register("practicingDay", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.practicingDay && <p className="text-red-500 text-sm">{errors.practicingDay.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Avg. Patient <span className="text-red-500">*</span></label>
                                    <input type="number" {...register("avgPatient", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.avgPatient && <p className="text-red-500 text-sm">{errors.avgPatient.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Avg. Patient/Day <span className="text-red-500">*</span></label>
                                    <input type="number" {...register("avgPatientDay", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.avgPatientDay && <p className="text-red-500 text-sm">{errors.avgPatientDay.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Patient Type</label>
                                    <select {...register("patientType")} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>Child</option>
                                        <option>Gyne</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Market Point</label>
                                    <select {...register("marketPoint")} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>Colleague Territory</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Doctor Type</label>
                                    <input {...register("doctorType")} className="border-gray-500 bg-white border p-2 text-sm" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Location/Address <span className="text-red-500">*</span></label>
                                    <input {...register("locationAddress", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.locationAddress && <p className="text-red-500 text-sm">{errors.locationAddress.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Division <span className="text-red-500">*</span></label>
                                    <input {...register("division", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.division && <p className="text-red-500 text-sm">{errors.division.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select District <span className="text-red-500">*</span></label>
                                    <input {...register("district", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.district && <p className="text-red-500 text-sm">{errors.district.message}</p>}
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Select Upazila <span className="text-red-500">*</span></label>
                                    <input {...register("upazila", { required: "Required" })} className="border-gray-500 bg-white border p-2 text-sm" />
                                    {errors.upazila && <p className="text-red-500 text-sm">{errors.upazila.message}</p>}
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
                                    <label className="text-[#6E719A] mb-1 text-sm">Location</label>
                                    <input {...register("location")} className="border-gray-500 bg-white border p-2 text-sm" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Brand</label>
                                    <select {...register("brand")} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                        <option>D</option>
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[#6E719A] mb-1 text-sm">Chemist</label>
                                    <select {...register("chemist")} className="border-gray-500 bg-white border p-2 text-sm">
                                        <option value="">Select</option>
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                        <option>D</option>
                                    </select>
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