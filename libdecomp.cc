#include "libdecomp.hh"

namespace ghidra {

void startDecompilerLibrary(const char *sleighhome)

{
  AttributeId::initialize();
  ElementId::initialize();
  CapabilityPoint::initializeAll();
  ArchitectureCapability::sortCapabilities();

  if (sleighhome != (const char *)0)
    SleighArchitecture::scanForSleighDirectories(sleighhome);
}

void startDecompilerLibrary(const vector<string> &extrapaths)

{
  AttributeId::initialize();
  ElementId::initialize();
  CapabilityPoint::initializeAll();
  ArchitectureCapability::sortCapabilities();

  for(uint4 i=0;i<extrapaths.size();++i)
    SleighArchitecture::specpaths.addDir2Path(extrapaths[i]);
}

void startDecompilerLibrary(const char *sleighhome,const vector<string> &extrapaths)

{
  AttributeId::initialize();
  ElementId::initialize();
  CapabilityPoint::initializeAll();
  ArchitectureCapability::sortCapabilities();

  if (sleighhome != (const char *)0)
    SleighArchitecture::scanForSleighDirectories(sleighhome);

  for(uint4 i=0;i<extrapaths.size();++i)
    SleighArchitecture::specpaths.addDir2Path(extrapaths[i]);
}

void shutdownDecompilerLibrary(void)

{
}

} // End namespace ghidra
