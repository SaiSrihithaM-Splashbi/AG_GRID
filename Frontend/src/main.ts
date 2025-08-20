import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { LicenseManager } from 'ag-grid-enterprise';
import { provideHttpClient } from '@angular/common/http';
import 'ag-grid-enterprise';

import { ModuleRegistry } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

// Register ExcelExport module explicitly
ModuleRegistry.registerModules([ExcelExportModule]);


LicenseManager.setLicenseKey("Using_this_{AG_Grid}_Enterprise_key_{AG-064082}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Splash_Business_Intelligence_Inc}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{SplashBI}_only_for_{1}_Front-End_JavaScript_developer___All_Front-End_JavaScript_developers_working_on_{SplashBI}_need_to_be_licensed___{SplashBI}_has_been_granted_a_Deployment_License_Add-on_for_{Unlimited}_Production_Environments___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{29_January_2026}____[v3]_[01]_MTc2OTY0NDgwMDAwMA==34aedeb306f17af45b5c082d95221e4f");

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()]
});
