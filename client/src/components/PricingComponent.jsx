import { useState, useEffect, useContext } from 'react'

import { Check } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const PricingComponent = () => {
    const { backendUrl } = useContext(AppContext);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch packages from backend
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/admin/packages`);
                if (data.success) {
                    // Filter only active packages and sort by displayOrder
                    const activePackages = data.packages
                        .filter(pkg => pkg.isActive)
                        .sort((a, b) => a.displayOrder - b.displayOrder);
                    setPackages(activePackages);
                }
            } catch (error) {
                console.error("Error fetching packages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [backendUrl]);

    // Determine if package should have recommended badge (middle package or highest price)
    const getRecommendedIndex = () => {
        if (packages.length === 0) return -1;
        if (packages.length === 1) return 0;
        if (packages.length === 2) return 1;
        // For 3+ packages, return middle index
        return Math.floor(packages.length / 2);
    };

    const recommendedIndex = getRecommendedIndex();
    return (
        <div>

            {loading ? (
                <div className='mt-10 text-gray-500'>Loading packages...</div>
            ) : packages.length === 0 ? (
                <div className='mt-10 text-gray-500'>No packages available at the moment.</div>
            ) : (
                <div className='mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4'>
                    {packages.map((pkg, index) => {
                        const isRecommended = index === recommendedIndex;
                        const isFree = pkg.price === 0;

                        // Currency symbol mapping
                        const currencySymbols = {
                            'USD': '$',
                            'EUR': '€',
                            'GBP': '£',
                            'PKR': '₨',
                            'INR': '₹',
                            'AED': 'د.إ'
                        };

                        const currencySymbol = currencySymbols[pkg.currency] || pkg.currency;

                        // Build features array from package data
                        const allFeatures = [];

                        // Job Postings
                        allFeatures.push(`${pkg.jobPostings} job posting${pkg.jobPostings !== 1 ? 's' : ''}`);

                        // Featured Jobs
                        if (pkg.featuredJobs > 0) {
                            allFeatures.push(`${pkg.featuredJobs} featured job${pkg.featuredJobs !== 1 ? 's' : ''}`);
                        }

                        // Candidates Follow
                        if (pkg.candidatesFollow > 0) {
                            allFeatures.push(`Follow up to ${pkg.candidatesFollow} candidate${pkg.candidatesFollow !== 1 ? 's' : ''}`);
                        }

                        // Candidate Access
                        if (pkg.candidateAccess) {
                            allFeatures.push('Candidate database access');
                        }

                        // Invite Candidates
                        if (pkg.inviteCandidates) {
                            allFeatures.push('Can invite candidates');
                        }

                        // Send Messages
                        if (pkg.sendMessages) {
                            allFeatures.push('Can send messages');
                        }

                        // Print Profiles
                        if (pkg.printProfiles) {
                            allFeatures.push('Can print candidate profiles');
                        }

                        // Review Comment
                        if (pkg.reviewComment) {
                            allFeatures.push('Can review and comment');
                        }

                        // View Candidate Info
                        if (pkg.viewCandidateInfo) {
                            allFeatures.push('Can view candidate information');
                        }

                        // Support
                        allFeatures.push(`${pkg.support} support`);

                        // Custom Features
                        if (pkg.features && pkg.features.length > 0) {
                            allFeatures.push(...pkg.features);
                        }

                        return (
                            <div
                                key={pkg._id}
                                className={`hover:shadow-xl shadow-gray-200 transition-all relative rounded-lg cursor-pointer border ${isRecommended ? 'border-yellow-400' : 'border-gray-200'
                                    } bg-white p-8`}
                            >
                                <p className='text-[var(--primary-color)] font-semibold uppercase text-sm'>
                                    {pkg.name}
                                </p>

                                <div className='mt-3 flex items-end gap-1'>
                                    {!isFree && (
                                        <span className='text-xl self-start text-black'>{currencySymbol}</span>
                                    )}
                                    <h4 className='text-5xl font-semibold text-black'>
                                        {isFree ? 'Free' : pkg.price}
                                    </h4>
                                    <span className='text-gray-500 text-lg'>
                                        /{pkg.durationUnit === 'year' ? 'year' : 'month'}
                                    </span>
                                </div>

                                {isRecommended && (
                                    <span className='absolute right-3 top-3 rounded-full bg-yellow-400/30 text-yellow-800 text-sm font-semibold px-3 py-1'>
                                        Recommended
                                    </span>
                                )}

                                <div className='my-6 h-px bg-gray-200' />

                                <div className='space-y-5 overflow-auto max-h-48 text-gray-700'>
                                    {allFeatures.map((feature, idx) => (
                                        <div key={idx} className='flex items-center gap-3'>
                                            <Check className={isRecommended ? 'text-[var(--primary-color)]' : 'text-green-900'} size={20} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className={`${isRecommended ? 'primary-btn' : 'secondary-btn'} w-full mt-10`}>
                                    Get Started
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default PricingComponent