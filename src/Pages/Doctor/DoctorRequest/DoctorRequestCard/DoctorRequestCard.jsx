import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import useApiConfig from "../../../../Hooks/useApiConfig";
import useAuth from "../../../../Hooks/useAuth";
import useSingleUser from "../../../../Hooks/useSingleUser";

const DoctorRequestCard = ({ idx, doctor, refetch }) => {
    const { user } = useAuth();
    const baseUrl = useApiConfig();
    const [singleUser] = useSingleUser();
    const [isModalOpen, setModalOpen] = useState(false);

    const InfoRow = ({ label, value }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-base text-gray-800 font-medium">{value || "N/A"}</span>
        </div>
    );

    const approvedDoctorMutation = useMutation({
        mutationFn: async () => {
            const updatedDoctor = {
                ...doctor,
                status: "approved",
                approvedBy: singleUser?.name,
                approvedEmail: user?.email
            }
            const response = await axios.patch(`${baseUrl}/doctor-status/${doctor._id}`, updatedDoctor);
            return response.data;
        },
        onError: (error) => {
            console.error("Error approved doctor request:", error);
        }
    });

    const deniedDoctorMutation = useMutation({
        mutationFn: async () => {
            const updatedDoctor = {
                ...doctor,
                status: 'denied'
            }
            const response = await axios.patch(`${baseUrl}/doctor-status/${doctor._id}`, updatedDoctor);
            return response.data;
        },
        onError: (error) => {
            console.error("Error denied doctor request:", error);
        }
    });

    const handleApprove = async () => {
        try {
            await Promise.all([
                approvedDoctorMutation.mutateAsync()
            ]);

            refetch();
            Swal.fire({
                title: "Success!",
                text: "Request approved.",
                icon: "success",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error("Error approved request:", error);
            alert("Failed to approve.");
        }
    };

    const handleDeny = () => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, deny!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await Promise.all([
                        deniedDoctorMutation.mutateAsync()
                    ]);

                    refetch();
                    Swal.fire({
                        title: "Success!",
                        text: "Request Denied.",
                        icon: "success",
                        showConfirmButton: false,
                        timer: 1500
                    });
                } catch (error) {
                    console.error("Error denied request:", error);
                    alert("Failed to deny");
                }
            }
        });
    };

    return (
        <>
            <tr>
                <td className="text-center">{idx}</td>
                <td><div className="font-bold">{doctor.name}</div></td>
                <td>{doctor.visitingAddress}</td>
                <td className="text-center">{doctor.territory}</td>
                <td>{doctor.addedBy}</td>
                <td className="text-center">
                    {new Date(doctor.date).toISOString().split("T")[0].split("-").reverse().join("-")}
                </td>
                <td className="text-center">
                    <button
                        onClick={() => setModalOpen(true)}
                        title="Details"
                        className="p-2 rounded-[5px] hover:bg-orange-100 focus:outline-none"
                    >
                        <FaEye className="text-orange-500" />
                    </button>
                </td>
                <td className="text-center">
                    <button
                        onClick={handleDeny}
                        title="Deny Request"
                        className="p-2 rounded-[5px] hover:bg-red-100 focus:outline-none"
                    >
                        <FaTimes className="text-red-500" />
                    </button>
                </td>
            </tr>

            {/* Modal */}
            {isModalOpen && doctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div
                        className="bg-white rounded-lg shadow-lg w-full max-w-lg h-[80vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                            <div>
                                <p className="text-xl font-semibold">{doctor.name}</p>
                                <p className="text-base">{doctor.designation}</p>
                                <p className="text-sm text-gray-500">{doctor.speciality}</p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                aria-label="Close modal"
                                className="text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-125"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-4 overflow-y-auto flex-1 space-y-8">
                            {/* Sections */}
                            {[
                                {
                                    title: 'Personal Information',
                                    rows: [
                                        ['Contact No.', doctor.contact],
                                        ['Date of Birth', doctor.dob],
                                        ['Email', doctor.email],
                                        ['Marriage Date', doctor.marriageDate],
                                        ['Religion', doctor.religion],
                                    ],
                                },
                                {
                                    title: 'Professional Information',
                                    rows: [
                                        ['Qualification', doctor.qualification],
                                        ['Passing Institute', doctor.institute],
                                        ['Passing Year', doctor.passingYear],
                                    ],
                                },
                                {
                                    title: 'MISC Information',
                                    rows: [
                                        ['Category', doctor.category],
                                        ['Practicing Day', doctor.practicingDay],
                                        ['Avg. Patient', doctor.avgPatient],
                                        ['Avg. Patient/Day', doctor.avgPatientPerDay],
                                        ['Patient Type', doctor.practicingType],
                                        ['Market Point', doctor.marketPoint],
                                        ['Working Area', doctor.workingArea],
                                        ['Doctor Type', doctor.doctorType],
                                        ['Location/Address', doctor.location],
                                        ['Division', doctor.division],
                                        ['District', doctor.district],
                                        ['Union', doctor.union],
                                        ['Territory', doctor.territory],
                                        ['Job Institute', doctor.jobInstitute],
                                        ['Visiting Address', doctor.visitingAddress],
                                    ],
                                },
                            ].map((section, idx) => (
                                <section key={idx}>
                                    <h2 className="text-lg font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit mb-2">
                                        {section.title}
                                    </h2>
                                    <div className="grid grid-cols-1 gap-3">
                                        {section.rows.map(([label, value], i) => (
                                            <InfoRow key={i} label={label} value={value} />
                                        ))}
                                    </div>
                                </section>
                            ))}

                            {/* Brands */}
                            <section>
                                <h2 className="text-lg font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit mb-2">Brands Prescribed</h2>
                                {doctor.brands?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {doctor.brands.map((brand, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-[#FFAD46] text-lg">•</span>
                                                <div>
                                                    <p className="text-base text-[#344054] font-semibold">{brand.name}</p>
                                                    <p className="text-sm text-gray-500">{brand.netWeight}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center">No brands assigned.</p>
                                )}
                            </section>

                            {/* Chemists */}
                            <section>
                                <h2 className="text-lg font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit mb-2">Linked Chemists</h2>
                                {doctor.chemists?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {doctor.chemists.map((chem, idx) => (
                                            <li key={idx}>
                                                <p className="flex items-center gap-2 text-[#FFAD46] text-base font-semibold">
                                                    <span>•</span>
                                                    <span className="text-[#344054]">{chem.name} - <span className="font-normal">{chem.customerId}</span></span>
                                                </p>
                                                <p className="ml-6 text-sm text-gray-500">{chem.address}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center">No chemists assigned.</p>
                                )}
                            </section>

                            {/* Chamber Info */}
                            {doctor.chamberName && (
                                <section>
                                    <h2 className="text-lg font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit mb-2">Chamber Information</h2>
                                    <div className="grid grid-cols-1 gap-3">
                                        <InfoRow label="Chamber Name" value={doctor.chamberName} />
                                        <InfoRow label="Chamber Address" value={doctor.chamberAddress} />
                                        <InfoRow label="Phone" value={doctor.chamberPhone} />
                                    </div>
                                </section>
                            )}
                            <button
                                onClick={() => handleApprove()}
                                className="mt-5 w-full px-4 py-2 text-white bg-green-500 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Approve
                            </button>
                        </div>


                        {/* Footer */}
                        <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 text-white bg-red-500 rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ >
    );
};

export default DoctorRequestCard;