import { useParams } from "react-router-dom";
import PageTitle from "../../../Components/PageTitle/PageTitle";
import useDoctors from "../../../Hooks/useDoctors";

const DoctorDetails = () => {
    const [doctors] = useDoctors();
    const { id } = useParams();
    const doctor = doctors.find(doc => doc._id === id);

    if (!doctor) {
        return <div className="text-center text-xl font-semibold mt-10">Doctor not found</div>;
    }

    const InfoRow = ({ label, value }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-base text-gray-800 font-medium">{value || "N/A"}</span>
        </div>
    );

    return (
        <>
            <PageTitle
                from={"Doctor"}
                to={"Doctor details"}
            />
            <div className="bg-white">
                <h1 className="px-6 py-3 font-bold">Doctor details</h1>
                <hr className='text-center border border-gray-500 mb-5' />
                <div className="bg-white text-gray-800 p-6 mx-auto space-y-10">
                    {/* Header */}
                    <div className="space-y-1 border-b pb-4">
                        <p className="text-2xl font-semibold text-[#ffad46]">{doctor.name}</p>
                        <p className="text-lg">{doctor.designation}</p>
                        <p className="text-sm text-gray-500">{doctor.speciality}</p>
                    </div>

                    {/* Personal Info */}
                    <section>
                        <div className="flex justify-center mb-2">
                            <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                Personal Information
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <InfoRow label="Contact No." value={doctor.contact} />
                            <InfoRow label="Date of Birth" value={doctor.dob} />
                            <InfoRow label="Email" value={doctor.email} />
                            <InfoRow label="Marriage Date" value={doctor.marriageDate} />
                            <InfoRow label="Religion" value={doctor.religion} />
                        </div>
                    </section>

                    {/* Professional Info */}
                    <section>
                        <div className="flex justify-center mb-2">
                            <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                Professional Information
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <InfoRow label="Qualification" value={doctor.qualification} />
                            <InfoRow label="Passing Institute" value={doctor.institute} />
                            <InfoRow label="Passing Year" value={doctor.passingYear} />
                        </div>
                    </section>

                    {/* MISC Info */}
                    <section>
                        <div className="flex justify-center mb-2">
                            <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                MISC Information
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            <InfoRow label="Category" value={doctor.category} />
                            <InfoRow label="Practicing Day" value={doctor.practicingDay} />
                            <InfoRow label="Avg. Patient" value={doctor.avgPatient} />
                            <InfoRow label="Avg. Patient/Day" value={doctor.practicingDay} />
                            <InfoRow label="Patient Type" value={doctor.patientType} />
                            <InfoRow label="Market Point" value={doctor.marketPoint} />
                            <InfoRow label="Working Area" value={doctor.workingArea} />
                            <InfoRow label="Doctor Type" value={doctor.doctorType} />
                            <InfoRow label="Location/Address" value={doctor.location} />
                            <InfoRow label="Division" value={doctor.division} />
                            <InfoRow label="District" value={doctor.district} />
                            <InfoRow label="Union" value={doctor.union} />
                            <InfoRow label="Territory" value={doctor.territory} />
                            <InfoRow label="Job Institute" value={doctor.jobInstitute} />
                            <InfoRow label="Visiting Address" value={doctor.visitingAddress} />
                        </div>
                    </section>

                    {/* Brands */}
                    <section className="mt-8">
                        <div className="flex justify-center mb-4">
                            <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                Brands Prescribed
                            </h2>
                        </div>
                        {doctor.brands?.length > 0 ? (
                            <ul className="space-y-4">
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
                    <section className="mt-10">
                        <div className="flex justify-center mb-4">
                            <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                Linked Chemists
                            </h2>
                        </div>
                        {doctor.chemists?.length > 0 ? (
                            <ul className="space-y-4">
                                {doctor.chemists.map((chem, idx) => (
                                    <li key={idx}>
                                        <p className="flex items-center gap-2 text-[#FFAD46] text-lg font-semibold">
                                            <span>•</span>
                                            <span className="text-[#344054]">{chem.name} - <span className="font-normal">{chem.customerId}</span></span>
                                        </p>
                                        <p className="ml-10 text-sm text-gray-500">
                                            {chem.address}
                                        </p>
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
                            <div className="flex justify-center mb-2">
                                <h2 className="text-xl font-semibold text-[#344054] border-b-2 border-[#FFAD46] pb-1 w-fit">
                                    Chamber Informations
                                </h2>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6">
                                <InfoRow label="Chamber Name" value={doctor.chamberName} />
                                <InfoRow label="Chamber Address" value={doctor.chamberAddress} />
                                <InfoRow label="Phone" value={doctor.chamberPhone} />
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
};

export default DoctorDetails;