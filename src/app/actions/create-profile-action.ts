
'use server';

// This input type is exported for use in other server components if needed.
export type CreateProfileInput = {
  uid: string;
  name: string;
  email: string;
  role: 'farmer' | 'dealer' | 'admin';
  status: 'Pending' | 'Active' | 'Suspended';
  planType: 'free' | 'premium';
  mobileNumber?: string;
  state: string;
  district: string;
  pinCode?: string;
};

// The output type for this action.
export type CreateProfileOutput = {
  success: boolean;
  message: string;
  userProfile?: any; // The profile object to be saved on the client.
};

// The main exported function that can be called from server components.
export async function createProfile(input: CreateProfileInput): Promise<CreateProfileOutput> {
  // This is now a simple async function, no Genkit flow needed.
  try {
    const userProfile: any = {
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      planType: input.planType,
      mobileNumber: input.mobileNumber || "",
      state: input.state,
      district: input.district,
      pinCode: input.pinCode || "",
      aiQueriesCount: 0,
      lastQueryDate: "",
      dateJoined: new Date().toISOString(),
    };

    if (input.role === 'farmer') {
      userProfile.poultryMitraId = `PM-FARM-${input.uid.substring(0, 5).toUpperCase()}`;
      userProfile.connectedDealers = [];
    }
    if (input.role === 'dealer') {
      userProfile.uniqueDealerCode = `DL-${input.uid.substring(0, 8).toUpperCase()}`;
      userProfile.connectedFarmers = [];
    }
    
    return {
      success: true,
      message: 'User profile object created successfully.',
      userProfile: userProfile,
    };
  } catch (error: any) {
    console.error('Error creating profile object:', error);
    return {
      success: false,
      message: error.message || 'An unexpected error occurred while creating the profile object.',
    };
  }
}
