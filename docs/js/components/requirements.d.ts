import { Signal } from '@preact/signals';
import { AccountAddress, CheckBoxes, EnsFuseName, FinalChildChecks, ParentChecks } from '../types/types.js';
import { OptionalSignal } from '../utils/OptionalSignal.js';
interface SwitchAddressProps {
    maybeAccountAddress: OptionalSignal<AccountAddress>;
    maybeSigningAddress: Signal<AccountAddress | undefined>;
    requirementsMet: boolean;
}
export declare const SwitchAddress: ({ maybeSigningAddress, maybeAccountAddress, requirementsMet }: SwitchAddressProps) => import("preact").JSX.Element;
export declare const ChildRequirements: ({ checkBoxes, fuses }: {
    checkBoxes: FinalChildChecks;
    fuses: readonly EnsFuseName[];
}) => import("preact").JSX.Element;
export declare const ParentRequirements: ({ checkBoxes, fuses }: {
    checkBoxes: ParentChecks;
    fuses: readonly EnsFuseName[];
}) => import("preact").JSX.Element;
export declare const EnsRequirements: () => import("preact").JSX.Element;
export declare const Requirements: ({ checkBoxesArray }: {
    checkBoxesArray: OptionalSignal<CheckBoxes>;
}) => import("preact").JSX.Element;
interface RequirementProps {
    primarytext: string;
    secondaryText?: string;
    checked: boolean;
}
export declare const Requirement: ({ checked, primarytext, secondaryText }: RequirementProps) => import("preact").JSX.Element;
export declare const Immutable: ({ checkBoxesArray }: {
    checkBoxesArray: OptionalSignal<CheckBoxes>;
}) => import("preact").JSX.Element;
interface DeployProps {
    areContractsDeployed: Signal<boolean | undefined>;
    deploy: () => void;
}
export declare const DeployContract: ({ areContractsDeployed, deploy }: DeployProps) => import("preact").JSX.Element;
interface CreateProps {
    contentHashInput: Signal<string>;
    handleContentHashInput: (input: string) => void;
    resolutionAddressInput: Signal<string>;
    handleResolutionAddressInput: (input: string) => void;
    loadingInfos: Signal<boolean>;
    immutable: Signal<boolean>;
    maybeAccountAddress: OptionalSignal<AccountAddress>;
    checkBoxes: OptionalSignal<CheckBoxes>;
    updateInfos: (showLoading: boolean) => Promise<void>;
    creating: Signal<boolean>;
    areContractsDeployed: Signal<boolean | undefined>;
    extendYear: Signal<number>;
    extending: Signal<boolean>;
}
export declare const Create: ({ contentHashInput, resolutionAddressInput, loadingInfos, immutable, handleContentHashInput, handleResolutionAddressInput, maybeAccountAddress, checkBoxes, updateInfos, creating, areContractsDeployed, extendYear, extending }: CreateProps) => import("preact").JSX.Element;
export {};
//# sourceMappingURL=requirements.d.ts.map